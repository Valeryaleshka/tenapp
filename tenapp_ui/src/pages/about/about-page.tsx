import { useEffect, useRef, useState } from 'react'

import './about-page.css'

export function AboutPage() {
  const [htmlInput, setHtmlInput] = useState('<strong>Hello from user HTML</strong>')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previewElement = previewRef.current

    if (!previewElement) {
      return
    }

    const scriptElements = Array.from(previewElement.querySelectorAll('script'))

    scriptElements.forEach((scriptElement) => {
      const executableScript = document.createElement('script')

      Array.from(scriptElement.attributes).forEach(({ name, value }) => {
        executableScript.setAttribute(name, value)
      })

      executableScript.text = scriptElement.text
      scriptElement.replaceWith(executableScript)
    })
  }, [htmlInput])

  return (
    <div className="container py-4">
      <div className="about-page">
        <h1 className="h4 page-title mb-3">About Tenapp</h1>
        <p className="about-page-copy mb-4">
          Tenapp helps manage rental properties, tenant records, and account settings in one
          organized workspace.
        </p>

        <section className="about-html-demo" aria-labelledby="about-html-demo-title">
          <h2 id="about-html-demo-title" className="h5 mb-3">
            User HTML Preview
          </h2>

          <label className="form-label" htmlFor="about-html-input">
            HTML input
          </label>
          <textarea
            id="about-html-input"
            className="form-control about-html-input"
            value={htmlInput}
            onChange={(event) => setHtmlInput(event.target.value)}
          />

          <div className="about-html-preview mt-3">
            <div className="about-html-preview-label">Preview</div>
            <div
              ref={previewRef}
              className="about-html-preview-body"
              dangerouslySetInnerHTML={{ __html: htmlInput }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
