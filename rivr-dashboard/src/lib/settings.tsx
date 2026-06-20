import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { getProviders, getModels, checkHealth } from './api'
import { SettingsContext } from './settings-context'
import type { ApiSettings } from './settings-context'

const STORAGE_KEY = 'ai-career-settings'

function loadStored(): ApiSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ApiSettings
    if (parsed.provider && parsed.model) return parsed
  } catch {
    void 0
  }
  return null
}

function saveStored(settings: ApiSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    void 0
  }
}

export function SettingsProvider({ children }: { children: ReactNode }): ReactNode {
  const [provider, setProviderState] = useState<string>('')
  const [model, setModelState] = useState<string>('')
  const [apiKey, setApiKeyState] = useState<string>('')
  const [providers, setProviders] = useState<Awaited<ReturnType<typeof getProviders>> | null>(null)
  const [models, setModels] = useState<Awaited<ReturnType<typeof getModels>> | null>(null)
  const [backendOnline, setBackendOnline] = useState<boolean>(false)
  const [loadingProviders, setLoadingProviders] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init(): Promise<void> {
      const ok = await checkHealth()
      if (cancelled) return
      setBackendOnline(ok)
      if (!ok) {
        setLoadingProviders(false)
        setError('Backend offline — start FastAPI: uvicorn api:app --reload --port 8000')
        return
      }
      try {
        const p = await getProviders()
        if (cancelled) return
        setProviders(p)
        const stored = loadStored()
        if (stored && p[stored.provider]) {
          setProviderState(stored.provider)
          setModelState(stored.model)
          setApiKeyState(stored.apiKey)
        } else {
          const firstProvider = Object.keys(p)[0]
          if (firstProvider) {
            setProviderState(firstProvider)
          }
        }
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load providers')
      } finally {
        if (!cancelled) setLoadingProviders(false)
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [])

  const setProvider = useCallback((newProvider: string): void => {
    setProviderState(newProvider)
  }, [])

  const setModel = useCallback((newModel: string): void => {
    setModelState(newModel)
  }, [])

  const setApiKey = useCallback((key: string): void => {
    setApiKeyState(key)
  }, [])

  useEffect(() => {
    if (!provider || !providers) return
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const m = await getModels(provider)
        if (cancelled) return
        setModels(m)
        const freeKeys = Object.keys(m.free)
        const paidKeys = Object.keys(m.paid)
        const firstModel = freeKeys[0] ?? paidKeys[0] ?? ''
        if (firstModel) {
          const modelId = m.free[firstModel] ?? m.paid[firstModel] ?? ''
          setModelState((prev) => {
            const allModels = [...Object.values(m.free), ...Object.values(m.paid)]
            if (prev && allModels.includes(prev)) return prev
            return modelId
          })
        }
      } catch {
        if (!cancelled) setModels(null)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [provider, providers])

  useEffect(() => {
    if (provider && model) {
      saveStored({ provider, model, apiKey })
    }
  }, [provider, model, apiKey])

  const value = useMemo(() => ({
    settings: { provider, model, apiKey },
    setProvider,
    setModel,
    setApiKey,
    providers,
    models,
    backendOnline,
    loadingProviders,
    error,
  }), [provider, model, apiKey, providers, models, backendOnline, loadingProviders, error, setProvider, setModel, setApiKey])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}