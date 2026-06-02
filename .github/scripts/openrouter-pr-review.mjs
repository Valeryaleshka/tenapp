import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { OpenRouter } from '@openrouter/sdk'
import { jsonrepair } from 'jsonrepair'

const marker = '<!-- openrouter-pr-review -->'
const inlineMarker = '<!-- openrouter-pr-review-inline -->'
const maxDiffCharacters = 60000
const maxInlineComments = 20

const requiredEnv = ['GITHUB_EVENT_PATH', 'GITHUB_REPOSITORY', 'GITHUB_TOKEN', 'OPENROUTER_API_KEY']
for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`${name} is required`)
  }
}

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
const pullRequest = event.pull_request

if (!pullRequest) {
  throw new Error('This workflow must run on a pull_request event')
}

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'
const comparisonBaseRef = process.env.PR_REVIEW_BASE_REF || 'main'
const comparisonBaseRevision = `origin/${comparisonBaseRef}`
const headSha = pullRequest.head.sha

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
}

git([
  'fetch',
  '--no-tags',
  'origin',
  `+refs/heads/${comparisonBaseRef}:refs/remotes/origin/${comparisonBaseRef}`,
  headSha,
])

const diffRange = `${comparisonBaseRevision}...${headSha}`
const diffStat = git(['diff', '--stat', diffRange])
let diff = git([
  'diff',
  '--find-renames',
  '--diff-filter=ACMRTUXB',
  diffRange,
])

let truncated = false
if (diff.length > maxDiffCharacters) {
  diff = diff.slice(0, maxDiffCharacters)
  truncated = true
}

function collectChangedLines(patch) {
  const changedLinesByPath = new Map()
  let currentPath = null
  let newLine = 0

  for (const line of patch.split('\n')) {
    if (line.startsWith('+++ b/')) {
      currentPath = line.slice('+++ b/'.length)

      if (!changedLinesByPath.has(currentPath)) {
        changedLinesByPath.set(currentPath, new Set())
      }

      continue
    }

    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)(?:,(\d+))?/)
      newLine = match ? Number(match[1]) : 0
      continue
    }

    if (!currentPath || !newLine || line.startsWith('\\')) {
      continue
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      changedLinesByPath.get(currentPath)?.add(newLine)
      newLine += 1
      continue
    }

    if (line.startsWith('-') && !line.startsWith('---')) {
      continue
    }

    newLine += 1
  }

  return changedLinesByPath
}

const changedLinesByPath = collectChangedLines(diff)

const prompt = `You are reviewing pull request #${pullRequest.number} in ${owner}/${repo}.

Review only the changes shown below. The diff is always computed against ${comparisonBaseRevision}. Focus on bugs, regressions, security risks, missing tests, and maintainability issues. Do not suggest broad refactors unless they address a concrete risk.

Return only valid JSON with this exact shape. Escape any double quotes that appear inside JSON string values:
{
  "summary": "short review summary",
  "residualRisk": "short residual test or review risk",
  "findings": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "path": "path/from/repo/root",
      "line": 123,
      "body": "concise Markdown comment explaining the issue and concrete fix"
    }
  ]
}

Only include findings that can be tied to a changed added line in the diff. Use "critical" only for issues that should block merging because they are likely to cause production breakage, data loss, security exposure, auth bypass, secret leakage, or a severe regression. If there are no material findings, return an empty findings array.

Title:
${pullRequest.title}

Body:
${pullRequest.body || '(empty)'}

Diff stat:
${diffStat}

Diff${truncated ? `, truncated to ${maxDiffCharacters} characters` : ''}:
${diff}`

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const stream = await openrouter.chat.send({
  chatRequest: {
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    stream: true,
  },
})

let review = ''
let reasoningTokens

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content
  if (content) {
    review += content
  }

  if (chunk.usage) {
    reasoningTokens = chunk.usage.reasoningTokens
  }
}

if (!review.trim()) {
  throw new Error('OpenRouter returned an empty review')
}

function formatForActionsLog(text) {
  return text
    .split('\n')
    .map((line) => (line.startsWith('::') ? `: ${line.slice(1)}` : line))
    .join('\n')
}

process.stdout.write('::group::OpenRouter LLM response\n')
process.stdout.write(`${formatForActionsLog(review)}\n`)
process.stdout.write('::endgroup::\n')

function extractJson(text) {
  const trimmed = text.trim()
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed

  try {
    return JSON.parse(jsonText)
  } catch {
    return JSON.parse(jsonrepair(jsonText))
  }
}

function normalizeFinding(finding) {
  if (!finding || typeof finding !== 'object') {
    return null
  }

  const severity = String(finding.severity || '').toLowerCase()
  const path = String(finding.path || '').trim()
  const line = Number(finding.line)
  const body = String(finding.body || '').trim()

  if (!['critical', 'high', 'medium', 'low'].includes(severity) || !path || !line || !body) {
    return null
  }

  if (!changedLinesByPath.get(path)?.has(line)) {
    return null
  }

  return { severity, path, line, body }
}

let parsedReview
try {
  parsedReview = extractJson(review)
} catch (error) {
  throw new Error(`OpenRouter returned invalid JSON: ${error.message}`)
}

const summary =
  typeof parsedReview.summary === 'string' && parsedReview.summary.trim()
    ? parsedReview.summary.trim()
    : 'OpenRouter completed the PR review.'
const residualRisk =
  typeof parsedReview.residualRisk === 'string' && parsedReview.residualRisk.trim()
    ? parsedReview.residualRisk.trim()
    : ''
const findings = Array.isArray(parsedReview.findings)
  ? parsedReview.findings.map(normalizeFinding).filter(Boolean).slice(0, maxInlineComments)
  : []
const hasCriticalFinding = findings.some((finding) => finding.severity === 'critical')

const body = `${marker}
## OpenRouter PR Review

Model: \`${model}\`${truncated ? `\n\nNote: diff was truncated to ${maxDiffCharacters} characters.` : ''}
Base: \`${comparisonBaseRevision}\`
${typeof reasoningTokens === 'number' ? `\n\nReasoning tokens: ${reasoningTokens}` : ''}

${summary}
${residualRisk ? `\nResidual risk: ${residualRisk}` : ''}
${findings.length ? `\nInline findings: ${findings.length}` : '\nNo material inline findings.'}
${hasCriticalFinding ? '\n\nCritical issues were found. This check is failing to block merge.' : ''}`

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GitHub API ${response.status}: ${text}`)
  }

  return response.status === 204 ? null : response.json()
}

function writeStepSummary(markdown) {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return
  }

  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`)
}

try {
  const reviewComments = await githubRequest(
    `/repos/${owner}/${repo}/pulls/${pullRequest.number}/comments?per_page=100`,
  )

  for (const comment of reviewComments.filter((comment) => comment.body?.startsWith(inlineMarker))) {
    await githubRequest(`/repos/${owner}/${repo}/pulls/comments/${comment.id}`, {
      method: 'DELETE',
    })
  }

  await githubRequest(`/repos/${owner}/${repo}/pulls/${pullRequest.number}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commit_id: headSha,
      body,
      event: hasCriticalFinding ? 'REQUEST_CHANGES' : 'COMMENT',
      comments: findings.map((finding) => ({
        path: finding.path,
        line: finding.line,
        side: 'RIGHT',
        body: `${inlineMarker}\n**${finding.severity.toUpperCase()}** ${finding.body}`,
      })),
    }),
  })

  const issueComments = await githubRequest(
    `/repos/${owner}/${repo}/issues/${pullRequest.number}/comments?per_page=100`,
  )
  const previousSummaryComment = issueComments.find((comment) => comment.body?.startsWith(marker))

  if (previousSummaryComment) {
    await githubRequest(`/repos/${owner}/${repo}/issues/comments/${previousSummaryComment.id}`, {
      method: 'DELETE',
    })
  }
} catch (error) {
  writeStepSummary(body)
  console.warn(`Could not post PR review. Wrote review to job summary instead. ${error.message}`)
}

if (hasCriticalFinding) {
  throw new Error('OpenRouter found critical PR review issues')
}
