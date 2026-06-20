import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BookOpen,
  KeyRound,
  Code2,
  Wrench,
  Download,
  FileUp,
  Bot,
  FileSearch,
  Mail,
  MessageSquareQuote,
  FileText,
  ExternalLink,
  Search,
  ChevronDown,
  HelpCircle,
  Rocket,
  Shield,
  Zap,
  Globe,
  Cpu,
} from 'lucide-react'
import { getProviders, type ProvidersResponse, type ProviderInfo } from '../lib/api'

const TOOLS_DOCS = [
  {
    id: 'analyzer',
    name: 'Resume Analyzer',
    icon: FileSearch,
    desc: 'Upload your resume and a job description. The AI scores ATS compatibility, role match, hire probability, and surfaces missing skills, quick wins, red flags, and salary insight.',
    tips: [
      'Upload PDF or DOCX directly - text is extracted automatically',
      'Paste a job URL and the backend scrapes the description for you',
      'Download the full analysis as Word or PDF',
    ],
  },
  {
    id: 'letters',
    name: 'Smart Letters',
    icon: Mail,
    desc: 'Generate cover letters, follow-up emails, thank-you notes, referral requests, and LinkedIn outreach. Pick a tone (professional, friendly, confident, concise).',
    tips: [
      'Attach your resume so the letter references real achievements',
      'Paste the target job description for a tailored fit',
      'Copy to clipboard or export to Word/PDF',
    ],
  },
  {
    id: 'interview',
    name: 'Interview Prep',
    icon: MessageSquareQuote,
    desc: 'Get role-specific interview questions, STAR-method story templates, and salary negotiation scripts tuned by difficulty level.',
    tips: [
      'Attach your resume for STAR stories drawn from your real experience',
      'Choose difficulty: Easy, Standard, or Hard',
      'Export the full prep sheet as Word or PDF',
    ],
  },
  {
    id: 'builder',
    name: 'Resume Builder',
    icon: FileText,
    desc: 'Build a complete ATS-optimized resume from your name, target role, skills, and experience entries. Optionally upload an existing resume to enrich the output.',
    tips: [
      'Upload an old resume to reuse your real achievements',
      'Add multiple experience entries with role, company, and period',
      'Export the finished resume as Word or PDF',
    ],
  },
  {
    id: 'copilot',
    name: 'AI Copilot',
    icon: Bot,
    desc: 'Interactive chat coach for any career question. Ask for mock interviews, bullet rewrites, salary advice, or career strategy.',
    tips: [
      'Attach your resume once - the coach references it in every reply',
      'Use suggested prompts to get started quickly',
      'Conversation history is kept in-memory for the session',
    ],
  },
]

interface ApiEndpoint {
  method: 'GET' | 'POST'
  path: string
  desc: string
  body: string | null
  response: string
  auth: 'none' | 'optional' | 'required'
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/health',
    desc: 'Backend health check. Use to verify the FastAPI server is running.',
    body: null,
    response: '{ "ok": true }',
    auth: 'none',
  },
  {
    method: 'GET',
    path: '/api/providers',
    desc: 'List all 17 AI providers with descriptions, free/paid model names, key URLs, and tier info.',
    body: null,
    response: '{ "OpenRouter": { "description": "...", "get_key_url": "...", "free_models": [...], ... }, ... }',
    auth: 'none',
  },
  {
    method: 'GET',
    path: '/api/providers/{provider}/models',
    desc: 'Fetch free and paid models for a specific provider. Replace {provider} with the exact provider name.',
    body: null,
    response: '{ "free": { "Model Name": "model-id" }, "paid": { ... } }',
    auth: 'none',
  },
  {
    method: 'POST',
    path: '/api/analyze',
    desc: 'Analyze a resume against a job description. Returns a full AnalysisResult with scores, matched/missing skills, and insights.',
    body: '{\n  "provider": "OpenRouter",\n  "api_key": "sk-or-v1-...",\n  "model": "openrouter/auto",\n  "resume_text": "John Doe\\nSenior Engineer...",\n  "job_description": "We are hiring...",\n  "job_title": "Senior Engineer",\n  "company": "Acme Corp"\n}',
    response: '{ "ats_score": 85, "match_score": 78, "hire_probability": 72, "overall_summary": "...", "matched_skills": [...], "missing_skills": [...], "keyword_suggestions": [...], "strengths": [...], "improvements": [...], "quick_wins": [...], "red_flags": [...], "salary_insight": "...", "experience_gap": "...", "education_match": "..." }',
    auth: 'required',
  },
  {
    method: 'POST',
    path: '/api/generate',
    desc: 'Generate text from a single prompt. Used by Letters, Interview Prep, and Resume Builder tools.',
    body: '{\n  "provider": "Groq",\n  "api_key": "gsk_...",\n  "model": "llama-3.3-70b-versatile",\n  "prompt": "Write a cover letter for...",\n  "temperature": 0.7,\n  "max_tokens": 2000\n}',
    response: '{ "content": "Dear Hiring Manager..." }',
    auth: 'required',
  },
  {
    method: 'POST',
    path: '/api/chat',
    desc: 'Multi-turn chat with an optional system prompt. Used by the AI Copilot tool. Messages alternate user/assistant roles.',
    body: '{\n  "provider": "Google Gemini",\n  "api_key": "AIza...",\n  "model": "gemini-2.5-flash",\n  "system": "You are a career coach...",\n  "messages": [\n    { "role": "user", "content": "Help me negotiate" },\n    { "role": "assistant", "content": "Sure, lets..." },\n    { "role": "user", "content": "What if they say no?" }\n  ],\n  "temperature": 0.7\n}',
    response: '{ "content": "If they push back, you can..." }',
    auth: 'required',
  },
  {
    method: 'POST',
    path: '/api/scrape',
    desc: 'Scrape a job posting URL to extract the job description, title, and company. Used by the Analyzer tool.',
    body: '{ "url": "https://jobs.example.com/posting/123" }',
    response: '{ "ok": true, "job_description": "We are hiring...", "job_title": "Senior Engineer", "company": "Acme Corp" }',
    auth: 'none',
  },
  {
    method: 'POST',
    path: '/api/export',
    desc: 'Export arbitrary text content to a DOCX or PDF file. Returns a binary file blob for download.',
    body: '{\n  "title": "Cover Letter",\n  "body": "Dear Hiring Manager...",\n  "subtitle": "Acme Corp - Senior Engineer",\n  "format": "docx"\n}',
    response: 'Binary file blob (application/vnd.openxmlformats-officedocument.wordprocessingml.document or application/pdf)',
    auth: 'none',
  },
  {
    method: 'POST',
    path: '/api/export/analysis',
    desc: 'Export a full AnalysisResult object to a formatted DOCX or PDF report. Returns a binary file blob.',
    body: '{\n  "result": { "ats_score": 85, "match_score": 78, ... },\n  "format": "pdf"\n}',
    response: 'Binary file blob (application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document)',
    auth: 'none',
  },
  {
    method: 'POST',
    path: '/api/upload-resume',
    desc: 'Upload a PDF or DOCX resume file. The backend extracts text via PyPDF2, pdfplumber, and python-docx. Use multipart/form-data.',
    body: 'multipart/form-data:\nfile: <binary file content>',
    response: '{ "text": "John Doe\\nSenior Engineer...", "filename": "resume.pdf", "word_count": 342 }',
    auth: 'none',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is AI Career Suite free to use?',
    a: 'Yes, the software itself is free and open source. However, most AI providers require their own API key. 12 of the 17 providers offer free tiers - OpenRouter, NVIDIA Build, Groq, Google Gemini, Together AI, Hugging Face, and all 3 local providers (Ollama, LM Studio, llama.cpp) are completely free. Local providers run on your own machine with no API key needed.',
  },
  {
    q: 'Which provider should I use as a beginner?',
    a: 'OpenRouter is the best starting point. One free API key gives you access to 200+ models including free Llama 4, DeepSeek R1, Qwen3, Gemini, and more. Go to openrouter.ai/keys, create a key, and paste it into the Settings panel in any tool. The "Auto Free Router" model picks the best free model automatically.',
  },
  {
    q: 'How do I get an API key?',
    a: 'Each provider has its own key page. Open the Documentation, scroll to the AI Providers section, and click the "Get API Key" button next to any provider. This opens the providers key page in a new tab. Create an account, generate a key, and paste it into the Settings panel inside any tool.',
  },
  {
    q: 'Can I run everything offline without internet?',
    a: 'Yes. Install Ollama from ollama.com/download, run "ollama pull llama3.3", then select "Ollama (Local)" as your provider in Settings. No API key is needed. LM Studio and llama.cpp server also work fully offline with no key.',
  },
  {
    q: 'What file formats can I upload for my resume?',
    a: 'All 5 tools accept PDF and DOCX files. You can also paste resume text directly into the textarea. The backend extracts text using PyPDF2 and pdfplumber for PDFs, and python-docx for Word documents. Scanned image-only PDFs are not supported - the file must contain selectable text.',
  },
  {
    q: 'What can I download?',
    a: 'Every generated document - analysis reports, cover letters, interview prep sheets, and built resumes - includes one-click download buttons for both DOCX (Word) and PDF formats. The backend uses python-docx for Word files and fpdf2 for PDF files.',
  },
  {
    q: 'Is my data stored or sent anywhere?',
    a: 'Your resume text and job descriptions are sent only to the AI provider you select (e.g., OpenRouter, Groq). The backend stores analysis history in a local SQLite database (career_suite.db) for the Streamlit dashboard. The React dashboard does not persist data - everything stays in your browser session. No data is sent to any third party beyond your chosen AI provider.',
  },
  {
    q: 'What is the difference between the Streamlit app and the React dashboard?',
    a: 'Both have the same 5 tools and same AI backend. The Streamlit app (app.py, port 8501) is the original Python-based UI. The React dashboard (rivr-dashboard, port 5173) is a modern Vite + React + TypeScript UI that talks to the FastAPI backend (api.py, port 8000). Use whichever you prefer - the React dashboard has a more polished interface and dark mode support.',
  },
  {
    q: 'Can I use this for a job posting I found online?',
    a: 'Yes. In the Resume Analyzer, paste the job posting URL and click the scrape button. The backend fetches the page and extracts the job description, title, and company automatically. This works on most job boards including LinkedIn, Indeed, Glassdoor, and company career pages.',
  },
  {
    q: 'How accurate are the ATS scores?',
    a: 'ATS scores are AI-estimated based on keyword matching, skill alignment, experience relevance, and formatting signals. They are a strong indicator but not a guarantee - real ATS systems vary. Use the score as a guide to identify gaps, not as an absolute metric. The missing skills and keyword suggestions are the most actionable outputs.',
  },
  {
    q: 'What models are available?',
    a: '17 providers are supported with 300+ models total. Free models include Llama 4 Scout/Maverick, DeepSeek R1, Qwen3, Gemma, Phi-4, Gemini 2.5 Flash, Mistral, and more. Paid models include GPT-5.5, Claude Opus 4.8, Grok 4.3, Gemini 2.5 Pro, and DeepSeek V4 Pro. See the AI Providers section below for the full list.',
  },
  {
    q: 'How do I set a custom backend URL?',
    a: 'Set the VITE_API_BASE environment variable before starting the React dev server. Example: set VITE_API_BASE=http://my-server:8000 then run npm run dev. The API client uses this base URL for all requests. The default is http://localhost:8000.',
  },
]

const SETUP_STEPS = [
  { step: '1', title: 'Install Python dependencies', cmd: 'pip install -r requirements.txt', desc: 'Installs Streamlit, FastAPI, uvicorn, python-docx, fpdf2, PyPDF2, pdfplumber, and all AI provider libraries.' },
  { step: '2', title: 'Start the FastAPI backend', cmd: 'uvicorn api:app --reload --port 8000', desc: 'Serves the REST API on http://localhost:8000. This is what the React dashboard talks to.' },
  { step: '3', title: 'Start the React frontend', cmd: 'cd rivr-dashboard\nnpm install\nnpm run dev', desc: 'Vite dev server on http://localhost:5173. Set VITE_API_BASE to point at a different backend.' },
  { step: '4', title: '(Optional) Run the Streamlit app', cmd: 'streamlit run app.py', desc: 'The original Python UI on http://localhost:8501. Same features, different interface.' },
  { step: '5', title: 'Get an API key', cmd: '', desc: 'Pick any provider below, click the Get API Key link, create a key, and paste it into the Settings panel inside any tool.' },
]

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Rocket },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'providers', label: 'AI Providers', icon: Cpu },
  { id: 'api', label: 'API Reference', icon: Code2 },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'setup', label: 'Setup Guide', icon: BookOpen },
]

function Section({ id, icon: Icon, title, subtitle, children }: { id: string; icon: typeof BookOpen; title: string; subtitle?: string; children: ReactElement | ReactElement[] }): ReactElement {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-5 sm:p-7 scroll-mt-4"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(59,93,191,0.12), rgba(45,212,191,0.08))', border: '1px solid rgba(59,93,191,0.15)', color: 'var(--primary)' }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  )
}

function ProviderCard({ name, info }: { name: string; info: ProviderInfo }): ReactElement {
  const [expanded, setExpanded] = useState(false)
  const freeCount = info.free_models.length
  const paidCount = info.paid_models.length
  const allModels = [...info.free_models, ...info.paid_models]

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
    >
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{name}</h4>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {info.local_only && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: '#10a16e', border: '1px solid rgba(52,211,153,0.2)' }}>
                Offline
              </span>
            )}
            {info.needs_key ? (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#d97706', border: '1px solid rgba(251,191,36,0.2)' }}>
                API Key
              </span>
            ) : (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: '#10a16e', border: '1px solid rgba(52,211,153,0.2)' }}>
                Free
              </span>
            )}
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{info.description}</p>
        <div className="flex flex-wrap gap-1.5 text-[10px]" style={{ color: 'var(--text-dim)' }}>
          {freeCount > 0 && (
            <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: 'rgba(52,211,153,0.08)', color: '#10a16e', border: '1px solid rgba(52,211,153,0.15)' }}>
              {freeCount} free model{freeCount !== 1 ? 's' : ''}
            </span>
          )}
          {paidCount > 0 && (
            <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: 'rgba(59,93,191,0.08)', color: 'var(--primary)', border: '1px solid rgba(59,93,191,0.15)' }}>
              {paidCount} paid model{paidCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: 'var(--glass-bg)', color: 'var(--text-dim)', border: '1px solid var(--glass-border)' }}>
            {info.free_tier}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-medium self-start"
          style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {expanded ? 'Hide models' : `Show ${allModels.length} models`}
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 pt-1">
                {info.free_models.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1 mb-0.5" style={{ color: '#10a16e' }}>Free Models</p>
                    {info.free_models.map((m, i) => (
                      <div key={`f${i}`} className="flex items-center gap-1.5 text-[11px] rounded px-2 py-1" style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}>
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#34d399' }} />
                        {m}
                      </div>
                    ))}
                  </>
                )}
                {info.paid_models.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-2 mb-0.5" style={{ color: 'var(--primary)' }}>Paid Models</p>
                    {info.paid_models.map((m, i) => (
                      <div key={`p${i}`} className="flex items-center gap-1.5 text-[11px] rounded px-2 py-1" style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}>
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />
                        {m}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {info.needs_key && info.get_key_url && (
          <a
            href={info.get_key_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold mt-1 self-start rounded-full px-3.5 py-2 transition-transform"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <KeyRound className="w-3.5 h-3.5" /> Get API Key <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        )}
        {!info.needs_key && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium mt-1" style={{ color: '#10a16e' }}>
            <Shield className="w-3.5 h-3.5" /> No API key required
          </div>
        )}
      </div>
    </div>
  )
}

function FaqItem({ item, index }: { item: { q: string; a: string }; index: number }): ReactElement {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
        <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 pl-11 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DocumentationTool(): ReactElement {
  const [providers, setProviders] = useState<ProvidersResponse | null>(null)
  const [providerQuery, setProviderQuery] = useState('')

  useEffect(() => {
    let active = true
    getProviders()
      .then((data) => { if (active) setProviders(data) })
      .catch(() => { void 0 })
    return () => { active = false }
  }, [])

  const filteredProviders = providers
    ? Object.entries(providers).filter(([name, info]) => {
        const q = providerQuery.toLowerCase()
        return name.toLowerCase().includes(q) || info.description.toLowerCase().includes(q)
      })
    : []

  return (
    <div className="flex gap-6">
      <nav className="hidden lg:flex flex-col gap-1 sticky top-2 self-start w-44 flex-shrink-0">
        {NAV_SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </a>
          )
        })}
      </nav>

      <div className="flex flex-col gap-5 flex-1 min-w-0">
        <Section id="overview" icon={Rocket} title="AI Career Suite" subtitle="Talent Intelligence & Career Planning Platform">
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            AI Career Suite is a comprehensive career optimization platform with 5 AI-powered tools, 17 AI provider
            integrations, and 300+ models. Analyze resumes, generate cover letters, prepare for interviews, build
            ATS-optimized resumes, and chat with an AI career coach - all in one place.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Wrench, label: '5 Tools', value: 'Full suite' },
              { icon: Cpu, label: '17 Providers', value: '300+ models' },
              { icon: FileUp, label: 'PDF & DOCX', value: 'Upload support' },
              { icon: Download, label: 'Word & PDF', value: 'Export support' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-xl p-3.5 flex flex-col gap-1" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <Icon className="w-5 h-5 mb-1" style={{ color: 'var(--primary)' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{stat.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{stat.value}</p>
                </div>
              )
            })}
          </div>
        </Section>

        <Section id="tools" icon={Wrench} title="Tools" subtitle="5 AI-powered tools for every career stage">
          <div className="flex flex-col gap-3">
            {TOOLS_DOCS.map((t) => {
              const Icon = t.icon
              return (
                <div key={t.id} className="rounded-xl p-4 flex gap-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(59,93,191,0.12), rgba(45,212,191,0.08))', border: '1px solid rgba(59,93,191,0.15)', color: 'var(--primary)' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{t.name}</h4>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                    <ul className="flex flex-col gap-1">
                      {t.tips.map((tip, i) => (
                        <li key={i} className="text-[11px] flex gap-1.5 items-start" style={{ color: 'var(--text-dim)' }}>
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        <Section id="upload" icon={FileUp} title="Resume Upload" subtitle="PDF and DOCX support in every tool">
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Every tool accepts resume uploads in both PDF and DOCX format. Drag and drop a file or paste
            text directly. The backend extracts text automatically via PyPDF2, pdfplumber, and python-docx.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Analyzer', 'Smart Letters', 'Interview Prep', 'Resume Builder', 'AI Copilot'].map((label) => (
              <span key={label} className="text-xs rounded-full px-3 py-1.5 font-medium" style={{ background: 'rgba(52,211,153,0.08)', color: '#10a16e', border: '1px solid rgba(52,211,153,0.2)' }}>
                {label}
              </span>
            ))}
          </div>
        </Section>

        <Section id="export" icon={Download} title="Export" subtitle="Download as Word or PDF">
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Every generated document includes one-click download buttons for both DOCX and PDF. The backend
            uses python-docx for Word files and fpdf2 for PDF files.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(59,93,191,0.06)', border: '1px solid rgba(59,93,191,0.12)' }}>
              <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--primary)' }}>DOCX</p>
              <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>python-docx</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(220,38,85,0.06)', border: '1px solid rgba(220,38,85,0.12)' }}>
              <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: '#dc2655' }} />
              <p className="text-sm font-bold mb-0.5" style={{ color: '#dc2655' }}>PDF</p>
              <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>fpdf2</p>
            </div>
          </div>
        </Section>

        <Section id="providers" icon={Cpu} title="AI Providers" subtitle="17 providers, 300+ models, API key links for each">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              value={providerQuery}
              onChange={(e) => setProviderQuery(e.target.value)}
              placeholder="Search providers or models..."
              className="w-full rounded-lg pl-10 pr-3 py-2.5 text-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          {providers === null ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}>
              <Zap className="w-4 h-4 animate-pulse" style={{ color: 'var(--primary)' }} />
              Loading providers from backend...
            </div>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
                Showing {filteredProviders.length} of {Object.keys(providers).length} providers. Click a card to expand its full model list.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredProviders.map(([name, info]) => (
                  <ProviderCard key={name} name={name} info={info} />
                ))}
              </div>
            </>
          )}
        </Section>

        <Section id="api" icon={Code2} title="API Reference" subtitle="REST API endpoints with request and response schemas">
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            The FastAPI backend exposes these endpoints. All POST bodies are JSON (except upload-resume which uses multipart form-data).
            Base URL: <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--glass-bg)', color: 'var(--primary)' }}>http://localhost:8000</code>
          </p>
          <div className="flex flex-col gap-3">
            {API_ENDPOINTS.map((ep) => (
              <div key={ep.path} className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                <div className="p-4 flex items-center gap-2.5 flex-wrap border-b" style={{ borderColor: 'var(--glass-border)' }}>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md font-mono"
                    style={{
                      background: ep.method === 'GET' ? 'rgba(52,211,153,0.12)' : 'rgba(59,93,191,0.12)',
                      color: ep.method === 'GET' ? '#10a16e' : 'var(--primary)',
                    }}
                  >
                    {ep.method}
                  </span>
                  <code className="text-xs font-mono font-semibold" style={{ color: 'var(--text)' }}>{ep.path}</code>
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-medium" style={{ color: ep.auth === 'required' ? '#d97706' : '#10a16e' }}>
                    {ep.auth === 'required' ? <Shield className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {ep.auth === 'required' ? 'API key in body' : ep.auth === 'optional' ? 'Optional key' : 'No auth'}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{ep.desc}</p>
                  {ep.body && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-dim)' }}>Request Body</p>
                      <pre className="text-[11px] font-mono p-3 rounded-lg overflow-x-auto" style={{ background: 'var(--glass-bg)', color: 'var(--text)', border: '1px solid var(--glass-border)' }}>
                        {ep.body}
                      </pre>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-dim)' }}>Response</p>
                    <pre className="text-[11px] font-mono p-3 rounded-lg overflow-x-auto" style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                      {ep.response}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="faq" icon={HelpCircle} title="FAQ" subtitle="Frequently asked questions">
          <div className="flex flex-col gap-2.5">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} item={item} index={i} />
            ))}
          </div>
        </Section>

        <Section id="setup" icon={BookOpen} title="Setup Guide" subtitle="Get the app running locally in 5 steps">
          <div className="flex flex-col gap-4">
            {SETUP_STEPS.map((s) => (
              <div key={s.step} className="flex gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff' }}
                >
                  {s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{s.title}</h4>
                  {s.cmd && (
                    <pre className="text-xs font-mono mt-1 mb-2 p-3 rounded-lg overflow-x-auto" style={{ background: 'var(--glass-bg)', color: 'var(--text)', border: '1px solid var(--glass-border)' }}>
                      {s.cmd}
                    </pre>
                  )}
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}