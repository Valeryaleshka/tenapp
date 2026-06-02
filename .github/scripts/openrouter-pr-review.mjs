import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { OpenRouter } from '@openrouter/sdk'

const marker = '<!-- openrouter-pr-review -->'
const maxDiffCharacters = 60000

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
const baseSha = pullRequest.base.sha
const headSha = pullRequest.head.sha

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
}

git(['fetch', '--no-tags', 'origin', baseSha, headSha])

const diffStat = git(['diff', '--stat', `${baseSha}...${headSha}`])
let diff = git([
  'diff',
  '--find-renames',
  '--diff-filter=ACMRTUXB',
  `${baseSha}...${headSha}`,
])

let truncated = false
if (diff.length > maxDiffCharacters) {
  diff = diff.slice(0, maxDiffCharacters)
  truncated = true
}

const prompt = `You are reviewing pull request #${pullRequest.number} in ${owner}/${repo}.

Review only the changes shown below. Focus on bugs, regressions, security risks, missing tests, and maintainability issues. Do not suggest broad refactors unless they address a concrete risk.

Return concise Markdown. If there are findings, list them first with severity and file path. If there are no material findings, say that clearly and mention any residual test risk.

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
    stream: true,
  },
})

let review = ''
let reasoningTokens

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content
  if (content) {
    review += content
    process.stdout.write(content)
  }

  if (chunk.usage) {
    reasoningTokens = chunk.usage.reasoningTokens
  }
}

if (!review.trim()) {
  throw new Error('OpenRouter returned an empty review')
}

const body = `${marker}
## OpenRouter PR Review

Model: \`${model}\`${truncated ? `\n\nNote: diff was truncated to ${maxDiffCharacters} characters.` : ''}
${typeof reasoningTokens === 'number' ? `\n\nReasoning tokens: ${reasoningTokens}` : ''}

${review.trim()}`

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

const comments = await githubRequest(
  `/repos/${owner}/${repo}/issues/${pullRequest.number}/comments?per_page=100`,
)
const previousComment = comments.find((comment) => comment.body?.startsWith(marker))

if (previousComment) {
  await githubRequest(`/repos/${owner}/${repo}/issues/comments/${previousComment.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })
} else {
  await githubRequest(`/repos/${owner}/${repo}/issues/${pullRequest.number}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })
}
