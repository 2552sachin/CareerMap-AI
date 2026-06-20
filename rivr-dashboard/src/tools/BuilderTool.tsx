import { useState } from 'react'
import type { ReactElement } from 'react'
import { motion } from 'motion/react'
import { FileText, Loader2, Plus, X } from 'lucide-react'
import SettingsPanel from '../components/SettingsPanel'
import ResumeUpload from '../components/ResumeUpload'
import { ExportTextButtons } from '../components/ExportButtons'
import { SkeletonLetter, LoadingOverlay } from '../components/Skeleton'
import { useSettings } from '../lib/useSettings'
import { generateText } from '../lib/api'

interface Experience {
  role: string
  company: string
  period: string
}

interface FormState {
  name: string
  email: string
  role: string
  skills: string
  experiences: Experience[]
}

const initialState: FormState = {
  name: '',
  email: '',
  role: '',
  skills: '',
  experiences: [{ role: '', company: '', period: '' }],
}

function buildResumePrompt(form: FormState, existingResume: string): string {
  const expLines = form.experiences
    .filter((e) => e.role.trim())
    .map((e, i) => `  ${i + 1}. ${e.role} at ${e.company} (${e.period})`)
    .join('\n')

  const existingContext = existingResume.trim().length > 40
    ? `\n\nEXISTING RESUME (use this as additional context — extract and reuse any relevant achievements, skills, or details):\n${existingResume.slice(0, 3000)}`
    : ''

  return `You are an expert resume writer. Build a complete, ATS-optimized resume for ${form.name} targeting the role: ${form.role}.${existingContext}

Contact: ${form.name}, ${form.email}
Target Role: ${form.role}
Skills: ${form.skills}
Experience:
${expLines || '  (none provided)'}

Return the resume in this EXACT markdown format:

# ${form.name}
**${form.role}** | ${form.email}

## Professional Summary
[2-3 sentence professional summary tailored to the target role]

## Experience
For each role, provide the title, company, period, then 3 achievement-oriented bullet points with quantified results.

Format:
### [Role] — [Company] ([Period])
- Achievement bullet with metric
- Achievement bullet with metric
- Achievement bullet with metric

## Core Skills
- List each skill as a bullet point

Do not add any preamble or explanation. Output only the resume.`
}

function parseResume(raw: string): { summary: string; experienceHtml: string; skills: string[] } {
  const summaryMatch = raw.match(/##\s*Professional Summary\s*([\s\S]*?)(?=##\s*Experience|$)/i)
  const summary = summaryMatch ? summaryMatch[1].trim() : ''

  const expMatch = raw.match(/##\s*Experience\s*([\s\S]*?)(?=##\s*Core Skills|$)/i)
  const experienceHtml = expMatch ? expMatch[1].trim() : raw

  const skillsMatch = raw.match(/##\s*Core Skills\s*([\s\S]*?)$/i)
  const skillsText = skillsMatch ? skillsMatch[1].trim() : ''
  const skills = skillsText
    .split('\n')
    .map((s) => s.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)

  return { summary, experienceHtml, skills }
}

export default function BuilderTool(): ReactElement {
  const { settings } = useSettings()
  const [form, setForm] = useState<FormState>(initialState)
  const [existingResume, setExistingResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ raw: string; parsed: ReturnType<typeof parseResume> } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    form.name.trim().length > 1 &&
    form.email.trim().length > 4 &&
    form.role.trim().length > 1 &&
    form.skills.trim().length > 5 &&
    form.experiences[0].role.trim().length > 1 &&
    !loading

  function updateExp(idx: number, key: keyof Experience, value: string): void {
    setForm((prev) => {
      const next = [...prev.experiences]
      const target = next[idx]
      if (target) {
        next[idx] = { ...target, [key]: value }
      }
      return { ...prev, experiences: next }
    })
  }

  function addExp(): void {
    setForm((prev) => ({ ...prev, experiences: [...prev.experiences, { role: '', company: '', period: '' }] }))
  }

  function removeExp(idx: number): void {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.length === 1
        ? prev.experiences
        : prev.experiences.filter((_, i) => i !== idx),
    }))
  }

  async function handleBuild(): Promise<void> {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const prompt = buildResumePrompt(form, existingResume)
      const content = await generateText({
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
        prompt,
        temperature: 0.5,
        max_tokens: 2500,
      })
      setResult({ raw: content, parsed: parseResume(content) })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resume generation failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <LoadingOverlay label="Building your resume..." />
        <SkeletonLetter />
      </div>
    )
  }

  if (result) {
    const { parsed } = result
    return (
      <div className="flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <header className="border-b pb-3 mb-4" style={{ borderColor: 'var(--glass-border)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {form.name}
            </h3>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {form.role} · {form.email}
            </div>
          </header>

          {parsed.summary && (
            <section className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Professional Summary
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text)' }}>
                {parsed.summary}
              </p>
            </section>
          )}

          <section className="mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Experience
            </h4>
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text)' }}>
              {parsed.experienceHtml}
            </div>
          </section>

          {parsed.skills.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Core Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {parsed.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'var(--glass-bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--glass-border)',
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
        </motion.div>

        <ExportTextButtons
          title={`${form.name} — Resume`}
          body={result.raw}
          subtitle={form.role}
          filename={`resume-${form.name.toLowerCase().replace(/\s+/g, '-')}`}
        />

        <button
          type="button"
          onClick={() => { setResult(null); setForm(initialState) }}
          className="self-start rounded-full px-5 py-2 text-sm font-medium"
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border-strong)',
            cursor: 'pointer',
          }}
        >
          Build another resume
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
            Full Name
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Jane Doe"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jane@example.com"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Target Role
        </span>
        <input
          type="text"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          placeholder="Senior Frontend Engineer"
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
        />
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Experience
          </span>
          <button
            type="button"
            onClick={addExp}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add another
          </button>
        </div>
        {form.experiences.map((e, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-lg p-3" style={{ background: 'rgba(30,50,90,0.03)', border: '1px solid var(--glass-border)' }}>
            <input
              type="text"
              value={e.role}
              onChange={(ev) => updateExp(idx, 'role', ev.target.value)}
              placeholder="Role"
              className="rounded-md px-2.5 py-1.5 text-sm sm:col-span-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
            />
            <input
              type="text"
              value={e.company}
              onChange={(ev) => updateExp(idx, 'company', ev.target.value)}
              placeholder="Company"
              className="rounded-md px-2.5 py-1.5 text-sm sm:col-span-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
            />
            <input
              type="text"
              value={e.period}
              onChange={(ev) => updateExp(idx, 'period', ev.target.value)}
              placeholder="2021 — Present"
              className="rounded-md px-2.5 py-1.5 text-sm sm:col-span-2"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => removeExp(idx)}
              aria-label="Remove experience"
              className="sm:col-span-1 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(30,50,90,0.06)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
              disabled={form.experiences.length === 1}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Skills (comma separated)
        </span>
        <textarea
          value={form.skills}
          onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
          placeholder="React, TypeScript, GraphQL, Vite, Playwright…"
          rows={2}
          className="rounded-lg p-3 text-sm resize-y"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
        />
      </label>

      <ResumeUpload
        label="Existing Resume (optional - upload to enhance with your real achievements)"
        placeholder="...or paste existing resume text here"
        rows={3}
        value={existingResume}
        onChange={setExistingResume}
      />

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#dc2655' }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleBuild()}
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
          <><Loader2 className="w-4 h-4 animate-spin" /> Building…</>
        ) : (
          <><FileText className="w-4 h-4" /> Build Resume</>
        )}
      </button>
    </div>
  )
}