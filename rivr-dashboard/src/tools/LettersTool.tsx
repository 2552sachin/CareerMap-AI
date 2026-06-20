import { useState } from 'react'
import type { ReactElement } from 'react'
import { motion } from 'motion/react'
import { Loader2, ArrowRight, Copy, Check } from 'lucide-react'
import SettingsPanel from '../components/SettingsPanel'
import ResumeUpload from '../components/ResumeUpload'
import { ExportTextButtons } from '../components/ExportButtons'
import { SkeletonLetter, LoadingOverlay } from '../components/Skeleton'
import { useSettings } from '../lib/useSettings'
import { generateText } from '../lib/api'

type LetterType = 'Cover Letter' | 'Follow-Up' | 'Thank You' | 'Cold Outreach' | 'LinkedIn Message'

const LETTER_TYPES: LetterType[] = ['Cover Letter', 'Follow-Up', 'Thank You', 'Cold Outreach', 'LinkedIn Message']

function buildPrompt(type: LetterType, resume: string, context: string, tone: string): string {
  const typeMap: Record<LetterType, string> = {
    'Cover Letter': 'a cover letter',
    'Follow-Up': 'a follow-up email after applying or interviewing',
    'Thank You': 'a thank-you note after an interview',
    'Cold Outreach': 'a cold outreach message to a hiring manager or recruiter',
    'LinkedIn Message': 'a LinkedIn connection or direct message',
  }
  return `You are an expert career writer. Write ${typeMap[type]} in a ${tone.toLowerCase()} tone.

RESUME / LINKEDIN:
${resume}

RECIPIENT & OPPORTUNITY:
${context}

Requirements:
- Keep it concise (150-250 words for letters, 100-150 for LinkedIn).
- Reference specific details from the resume.
- Address the recipient and opportunity context directly.
- Do NOT use placeholders like [Company] — use the actual details provided.
- End with a clear call to action.
- Output only the letter text, no preamble or explanation.`
}

export default function LettersTool(): ReactElement {
  const { settings } = useSettings()
  const [type, setType] = useState<LetterType>('Cover Letter')
  const [resume, setResume] = useState('')
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [letter, setLetter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const canSubmit = resume.trim().length > 40 && context.trim().length > 20 && !loading

  async function handleGenerate(): Promise<void> {
    if (!canSubmit) return
    setLoading(true)
    setLetter(null)
    setError(null)
    try {
      const prompt = buildPrompt(type, resume, context, tone)
      const content = await generateText({
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
        prompt,
        temperature: 0.7,
        max_tokens: 800,
      })
      setLetter(content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy(): void {
    if (!letter) return
    void navigator.clipboard.writeText(letter).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <LoadingOverlay label="Generating your letter..." />
        <SkeletonLetter />
      </div>
    )
  }

  if (letter) {
    const subtitle = `${type} · ${tone} tone`
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Generated
          </span>
          <span
            style={{
              background: 'rgba(59,93,191,0.10)',
              color: 'var(--primary)',
              border: '1px solid rgba(59,93,191,0.18)',
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontWeight: 500,
            }}
          >
            {type}
          </span>
          <span
            style={{
              background: 'rgba(45,212,191,0.10)',
              color: 'var(--accent)',
              border: '1px solid rgba(45,212,191,0.20)',
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontWeight: 500,
            }}
          >
            {tone}
          </span>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl p-5 whitespace-pre-wrap leading-relaxed"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text)',
            fontSize: '0.92rem',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {letter}
        </motion.article>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            style={{
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check className="w-4 h-4" style={{ color: '#10a16e' }} /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <ExportTextButtons title={type} body={letter} subtitle={subtitle} filename={type.toLowerCase().replace(/\s+/g, '-')} />
          <button
            type="button"
            onClick={() => setLetter(null)}
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59,93,191,0.18)',
            }}
          >
            Write another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Document Type
        </span>
        <div className="flex flex-wrap gap-1.5">
          {LETTER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                background: type === t ? 'var(--primary)' : 'var(--glass-bg)',
                color: type === t ? '#fff' : 'var(--text-muted)',
                border: type === t ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ResumeUpload
        label="Your Resume / LinkedIn"
        placeholder="...or paste resume / LinkedIn text here"
        rows={4}
        value={resume}
        onChange={setResume}
      />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Recipient & Opportunity
        </span>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Who are you writing to, and why?"
          rows={3}
          className="w-full rounded-lg p-3 text-sm leading-relaxed resize-y"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Tone
        </span>
        <div className="flex flex-wrap gap-1.5">
          {['Professional', 'Friendly', 'Confident', 'Empathetic'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                background: tone === t ? 'var(--primary)' : 'var(--glass-bg)',
                color: tone === t ? '#fff' : 'var(--text-muted)',
                border: tone === t ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

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
          background: canSubmit
            ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
            : 'rgba(30,50,90,0.06)',
          color: canSubmit ? '#fff' : 'var(--text-dim)',
          border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          boxShadow: canSubmit ? '0 2px 8px rgba(59,93,191,0.18)' : 'none',
        }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
        ) : (
          <><ArrowRight className="w-4 h-4" /> Generate</>
        )}
      </button>
    </div>
  )
}