const API_BASE: string = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      detail = err.detail ?? err.error ?? detail
    } catch {
      try {
        const text = await res.text()
        if (text) detail = text.slice(0, 500)
      } catch {
        void 0
      }
    }
    throw new ApiError(detail, res.status)
  }
  return res.json() as Promise<T>
}

async function postBlob(path: string, body: unknown): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      detail = err.detail ?? err.error ?? detail
    } catch {
      void 0
    }
    throw new ApiError(detail, res.status)
  }
  return res.blob()
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

export interface ProviderInfo {
  description: string
  free_tier: string
  placeholder: string
  get_key_url: string
  local_only: boolean
  needs_key: boolean
  free_models: string[]
  paid_models: string[]
}

export type ProvidersResponse = Record<string, ProviderInfo>

export async function getProviders(): Promise<ProvidersResponse> {
  const res = await fetch(`${API_BASE}/api/providers`)
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status)
  return res.json() as Promise<ProvidersResponse>
}

export interface ModelsResponse {
  free: Record<string, string>
  paid: Record<string, string>
}

export async function getModels(provider: string): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/api/providers/${encodeURIComponent(provider)}/models`)
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status)
  return res.json() as Promise<ModelsResponse>
}

export interface AnalyzeParams {
  provider: string
  api_key: string
  model: string
  resume_text: string
  job_description: string
  job_title?: string
  company?: string
}

export interface AnalysisResult {
  ats_score: number
  match_score: number
  hire_probability: number
  overall_summary: string
  matched_skills: string[]
  missing_skills: string[]
  keyword_suggestions: string[]
  strengths: string[]
  improvements: string[]
  quick_wins: string[]
  red_flags: string[]
  salary_insight: string
  experience_gap: string
  education_match: string
  provider?: string
  model?: string
  job_title?: string
  company_name?: string
}

export async function analyzeResume(params: AnalyzeParams): Promise<AnalysisResult> {
  return postJson<AnalysisResult>('/api/analyze', params)
}

export interface GenerateParams {
  provider: string
  api_key: string
  model: string
  prompt: string
  temperature?: number
  max_tokens?: number
}

export interface GenerateResponse {
  content: string
}

export async function generateText(params: GenerateParams): Promise<string> {
  const res = await postJson<GenerateResponse>('/api/generate', params)
  return res.content
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatParams {
  provider: string
  api_key: string
  model: string
  messages: ChatMessage[]
  system?: string
  temperature?: number
  max_tokens?: number
}

export async function chat(params: ChatParams): Promise<string> {
  const res = await postJson<GenerateResponse>('/api/chat', params)
  return res.content
}

export interface ScrapeParams {
  url: string
}

export interface ScrapeResponse {
  ok: boolean
  job_description?: string
  job_title?: string
  company?: string
  error?: string
}

export async function scrapeJob(params: ScrapeParams): Promise<ScrapeResponse> {
  return postJson<ScrapeResponse>('/api/scrape', params)
}

export interface ExportParams {
  title: string
  body: string
  subtitle?: string
  format: 'docx' | 'pdf'
}

export async function exportDocument(params: ExportParams): Promise<Blob> {
  return postBlob('/api/export', params)
}

export interface AnalysisExportParams {
  result: AnalysisResult
  format: 'docx' | 'pdf'
}

export async function exportAnalysis(params: AnalysisExportParams): Promise<Blob> {
  return postBlob('/api/export/analysis', params)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface UploadResumeResponse {
  text: string
  filename: string
  word_count: number
}

export async function uploadResume(file: File): Promise<UploadResumeResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json() as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      void 0
    }
    throw new ApiError(detail, res.status)
  }
  return res.json() as Promise<UploadResumeResponse>
}