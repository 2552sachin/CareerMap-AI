import { useState } from 'react'
import type { ReactElement } from 'react'
import { motion } from 'motion/react'
import { Loader2, MessageSquareQuote, Star, DollarSign } from 'lucide-react'
import SettingsPanel from '../components/SettingsPanel'
import ResumeUpload from '../components/ResumeUpload'
import { ExportTextButtons } from '../components/ExportButtons'
import { SkeletonLetter, LoadingOverlay } from '../components/Skeleton'
import { useSettings } from '../lib/useSettings'
import { generateText } from '../lib/api'

type Difficulty = 'Junior' | 'Mid' | 'Senior' | 'Staff'

const DIFFICULTIES: Difficulty[] = ['Junior', 'Mid', 'Senior', 'Staff']

interface Question {
  q: string
  category: string
}

interface InterviewResult {
  questions: Question[]
  starStory: string
  negotiationScript: string
}

function buildPrompt(role: string, company: string, difficulty: Difficulty, resume: string): string {
  const resumeContext = resume.trim().length > 40
    ? `\n\nCANDIDATE'S RESUME (use this to tailor the STAR story and questions):\n${resume.slice(0, 3000)}`
    : ''
  return `You are an expert technical interviewer and career coach. Prepare interview material for a ${role} role${company ? ` at ${company}` : ''} at the ${difficulty} level.${resumeContext}

Return your response in this EXACT format:

## QUESTIONS
Provide 6-8 interview questions mixing behavioral, technical, system design, and leadership categories.
Format each question EXACTLY as:
[CATEGORY] Question text here.
Categories: Behavioral, Technical, System Design, Leadership

## STAR STORY
Write a sample STAR (Situation, Task, Action, Result) story that a candidate at this level could adapt. Use realistic but fictional details. Label each section clearly.

## NEGOTIATION SCRIPT
Write a salary negotiation script (2-4 sentences of actual spoken dialogue) the candidate can use as a starting point. Include context about why the number is justified.

Do not add any preamble or explanation outside these sections.`
}

function parseResult(raw: string): InterviewResult {
  const questions: Question[] = []

  const qSectionMatch = raw.match(/##\s*QUESTIONS\s*([\s\S]*?)(?=##\s*STAR|$)/i)
  if (qSectionMatch) {
    const qBlock = qSectionMatch[1]
    const lines = qBlock.split('\n').map((l) => l.trim()).filter(Boolean)
    for (const line of lines) {
      const m = line.match(/^\[([^\]]+)\]\s*(.+)$/)
      if (m) {
        questions.push({ category: m[1].trim(), q: m[2].trim() })
      }
    }
  }

  const starMatch = raw.match(/##\s*STAR STORY\s*([\s\S]*?)(?=##\s*NEGOTIATION|$)/i)
  const starStory = starMatch ? starMatch[1].trim() : ''

  const negMatch = raw.match(/##\s*NEGOTIATION SCRIPT\s*([\s\S]*?)$/i)
  const negotiationScript = negMatch ? negMatch[1].trim() : ''

  return { questions, starStory, negotiationScript }
}

const CATEGORY_COLORS: Record<string, string> = {
  Behavioral: '#8b5cf6',
  Technical: '#3b5dbf',
  'System Design': '#2dd4bf',
  Leadership: '#f59e0b',
}

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || '#6b7280'
}

export default function InterviewTool(): ReactElement {
  const { settings } = useSettings()
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Mid')
  const [resume, setResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InterviewResult | null>(null)
  const [raw, setRaw] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canSubmit = role.trim().length > 1 && !loading

  async function handleGenerate(): Promise<void> {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const content = await generateText({
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
        prompt: buildPrompt(role, company, difficulty, resume),
        temperature: 0.6,
        max_tokens: 2500,
      })
      setRaw(content)
      setResult(parseResult(content))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <LoadingOverlay label="Generating interview questions..." />
        <SkeletonLetter />
        <SkeletonLetter />
      </div>
    )
  }

  if (result) {
    return (
      <div className="flex flex-col gap-5">
        {result.questions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareQuote className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                Interview Questions
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {result.questions.map((item, i) => {
                const color = categoryColor(item.category)
                return (
                  <div
                    key={i}
                    className="rounded-lg p-3.5"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${color}1a`, color }}
                      >
                        {item.category}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                        {item.q}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>
        )}

        {result.starStory && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                STAR Story
              </h3>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.18)',
              }}
            >
              <pre
                className="whitespace-pre-wrap text-sm leading-relaxed font-sans"
                style={{ color: 'var(--text)', margin: 0 }}
              >
                {result.starStory}
              </pre>
            </div>
          </motion.section>
        )}

        {result.negotiationScript && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4" style={{ color: '#10a16e' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                Salary Negotiation Script
              </h3>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.18)',
              }}
            >
              <pre
                className="whitespace-pre-wrap text-sm leading-relaxed font-sans"
                style={{ color: 'var(--text)', margin: 0 }}
              >
                {result.negotiationScript}
              </pre>
            </div>
          </motion.section>
        )}

        <ExportTextButtons
          title={`Interview Prep — ${role}${company ? ` at ${company}` : ''}`}
          body={raw}
          subtitle={difficulty}
          filename={`interview-${role.toLowerCase().replace(/\s+/g, '-')}`}
        />

        <button
          type="button"
          onClick={() => { setResult(null); setRaw(''); setRole(''); setCompany(''); setResume('') }}
          className="self-start rounded-full px-5 py-2 text-sm font-medium"
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border-strong)',
            cursor: 'pointer',
          }}
        >
          Generate new prep
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel />

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Role
          </span>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Senior Backend Engineer"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Company (optional)
          </span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Stripe"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Difficulty Level
        </span>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => {
            const active = d === difficulty
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                style={{
                  background: active ? 'var(--primary)' : 'var(--glass-bg)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--glass-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      <ResumeUpload
        label="Your Resume (optional - improves STAR story & questions)"
        placeholder="...or paste resume text here"
        rows={3}
        value={resume}
        onChange={setResume}
      />

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#dc2655' }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleGenerate()}
        disabled={!canSubmit}
        className="rounded-full px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 self-start"
        style={{
          background: canSubmit ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'rgba(30,50,90,0.06)',
          color: canSubmit ? '#fff' : 'var(--text-dim)',
          border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          boxShadow: canSubmit ? '0 2px 8px rgba(59,93,191,0.18)' : 'none',
        }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</>
        ) : (
          <><MessageSquareQuote className="w-4 h-4" /> Generate Prep</>
        )}
      </button>
    </div>
  )
}