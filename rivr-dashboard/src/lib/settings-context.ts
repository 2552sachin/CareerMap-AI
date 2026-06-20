import { createContext } from 'react'
import type { ProvidersResponse, ModelsResponse } from './api'

export interface ApiSettings {
  provider: string
  model: string
  apiKey: string
}

export interface SettingsContextValue {
  settings: ApiSettings
  setProvider: (provider: string) => void
  setModel: (model: string) => void
  setApiKey: (key: string) => void
  providers: ProvidersResponse | null
  models: ModelsResponse | null
  backendOnline: boolean
  loadingProviders: boolean
  error: string | null
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)