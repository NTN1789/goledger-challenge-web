type ConnectionPanelProps = {
  apiBaseUrl: string
  username: string
  password: string
  isBusy: boolean
  onApiBaseUrlChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLoadSchemaOverview: () => void
}

export function ConnectionPanel({
  apiBaseUrl,
  username,
  password,
  isBusy,
  onApiBaseUrlChange,
  onUsernameChange,
  onPasswordChange,
  onLoadSchemaOverview,
}: ConnectionPanelProps) {
  return (
    <section className="panel control-panel">
      <div className="panel-heading compact-heading">
        <div>
          <p className="section-kicker">Connection</p>
          <h2>Credenciais e endpoint</h2>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={onLoadSchemaOverview}
          disabled={isBusy}
        >
          Carregar schema geral
        </button>
      </div>

      <div className="field-grid credentials compact-grid">
        <label>
          <span>Base URL</span>
          <input
            value={apiBaseUrl}
            onChange={(event) => onApiBaseUrlChange(event.target.value)}
            placeholder="/goledger-api"
          />
        </label>
        <label>
          <span>Username</span>
          <input
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="do email"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="do email"
          />
        </label>
      </div>
    </section>
  )
}
