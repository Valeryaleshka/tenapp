import { useEffect, useRef } from 'react'
import './testreview-page.css'

export function TestreviewPage() {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    host.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h1 class="h4 mb-0 page-title">Testreview</h1>
        </div>

        <div class="testreview-panel">
          <div class="testreview-section">
            <form id="testreview-form" novalidate>
              <div class="mb-3">
                <label class="form-label" for="testreview-input">Input</label>
                <input
                  class="form-control"
                  id="testreview-input"
                  name="testreviewInput"
                  type="text"
                  maxlength="120"
                  placeholder="Enter review text"
                />
              </div>

              <button class="btn btn-primary" type="submit">Apply Input</button>
            </form>

            <div class="testreview-output d-flex align-items-center mt-4 px-3" id="testreview-output" aria-live="polite">
              Waiting for input.
            </div>
          </div>
        </div>
      </div>
    `

    const form = host.querySelector<HTMLFormElement>('#testreview-form')
    const input = host.querySelector<HTMLInputElement>('#testreview-input')
    const output = host.querySelector<HTMLDivElement>('#testreview-output')

    const updateOutput = () => {
      if (!input || !output) {
        return
      }

      const value = input.value.trim()
      output.textContent = value ? value : 'Waiting for input.'
    }

    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault()
      updateOutput()
    }

    form?.addEventListener('submit', handleSubmit)
    input?.addEventListener('input', updateOutput)

    return () => {
      form?.removeEventListener('submit', handleSubmit)
      input?.removeEventListener('input', updateOutput)
      host.innerHTML = ''
    }
  }, [])

  return <div ref={hostRef} />
}
