import type { ReactElement } from 'react'
import { useSettings } from '../lib/useSettings'

interface SettingsPanelProps {
  compact?: boolean
}

export default function SettingsPanel({ compact = false }: SettingsPanelProps): ReactElement {
  const {
    settings,
    setProvider,
    setModel,
    setApiKey,
    providers,
    models,
    backendOnline,
    loadingProviders,
    error,
  } = useSettings()

  if (loadingProviders) {
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
        Loading AI providers…
      </div>
    )
  }

  if (error && !backendOnline) {
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#dc2655' }}>
        <strong>Backend offline.</strong> {error}
        <div className="mt-1.5 text-[11px] opacity-80">
          Start the backend with: <code>uvicorn api:app --reload --port 8000</code>
        </div>
      </div>
    )
  }

  const providerNames = providers ? Object.keys(providers) : []
  const freeModelLabels = models ? Object.keys(models.free) : []
  const paidModelLabels = models ? Object.keys(models.paid) : []
  const currentModelId = settings.model

  const currentModelLabel =
    freeModelLabels.find((l) => models!.free[l] === currentModelId) ??
    paidModelLabels.find((l) => models!.paid[l] === currentModelId) ??
    ''

  function handleModelChange(label: string): void {
    if (!models) return
    const id = models.free[label] ?? models.paid[label] ?? ''
    if (id) setModel(id)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text)',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-dim)',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl ${compact ? 'p-3' : 'p-4'}`}
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: backendOnline ? '#10a16e' : '#dc2655',
            boxShadow: `0 0 6px ${backendOnline ? '#10a16e' : '#dc2655'}`,
          }}
        />
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {backendOnline ? 'Backend online' : 'Backend offline'}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span style={labelStyle}>Provider</span>
          <select
            value={settings.provider}
            onChange={(e) => setProvider(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
          >
            {providerNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span style={labelStyle}>Model</span>
          <select
            value={currentModelLabel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
            disabled={!models}
          >
            {freeModelLabels.length > 0 && (
              <optgroup label="Free">
                {freeModelLabels.map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </optgroup>
            )}
            {paidModelLabels.length > 0 && (
              <optgroup label="Paid">
                {paidModelLabels.map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span style={labelStyle}>API Key</span>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your provider API key…"
          className="rounded-lg px-3 py-2 text-sm font-mono"
          style={inputStyle}
          autoComplete="off"
        />
      </label>

      {providers && providers[settings.provider] && (
        <a
          href={providers[settings.provider].get_key_url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs font-medium self-start"
          style={{ color: 'var(--primary)', textDecoration: 'none' }}
        >
          Get API key for {settings.provider} →
        </a>
      )}
    </div>
  )
}