type DebugPanelProps = {
  schemaPreview: string
  responsePreview: string
}

export function DebugPanel({ schemaPreview, responsePreview }: DebugPanelProps) {
  return (
    <details className="panel accordion-panel">
      <summary>
        <span className="section-kicker">Advanced</span>
        <strong>Debug da API</strong>
      </summary>

      <div className="preview-grid debug-grid">
        <label className="block-field">
          <span>Schema preview</span>
          <textarea value={schemaPreview} readOnly rows={12} />
        </label>
        <label className="block-field">
          <span>Last API response</span>
          <textarea value={responsePreview} readOnly rows={12} />
        </label>
      </div>
    </details>
  )
}
