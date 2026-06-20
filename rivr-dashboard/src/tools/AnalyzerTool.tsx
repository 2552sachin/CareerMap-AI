import { useState, useRef, useCallback } from 'react'
import type { ReactElement, DragEvent } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Check, AlertTriangle, Loader2, FileSearch, UploadCloud, FileText, X } from 'lucide-react'
import SettingsPanel from '../components/SettingsPanel'
import { ExportAnalysisButtons } from '../components/ExportButtons'
import { SkeletonAnalyzer, LoadingOverlay } from '../components/Skeleton'
import { useSettings } from '../lib/useSettings'
import { analyzeResume, uploadResume, type AnalysisResult } from '../lib/api'

function chipStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: `1px solid ${color}33`,
    fontSize: '0.74rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    fontWeight: 500,
  }
}

function ResultBlock({ label, value }: { label: string; value: number | string }): ReactElement {
  return (
    <div
      className="rounded-xl p-3 sm:p-4 flex-1"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
      <div className="text-xl sm:text-2xl font-semibold mt-0.5" style={{ color: 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}

function BarRow({ label, percent, color }: { label: string; percent: number; color: string }): ReactElement {
  const safePercent = Math.max(0, Math.min(100, percent))
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 sm:w-40 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(30,50,90,0.06)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safePercent}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="w-9 text-right text-xs font-semibold" style={{ color: 'var(--text)' }}>
        {safePercent}
      </span>
    </div>
  )
}

export default function AnalyzerTool(): ReactElement {
  const { settings } = useSettings()
  const [resume, setResume] = useState('')
  const [job, setJob] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSubmit = resume.trim().length > 40 && job.trim().length > 40 && !loading

  const handleFile = useCallback(async (file: File): Promise<void> => {
    const ext = file.name.toLowerCase().split('.').pop() ?? ''
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Only .pdf or .docx files are supported.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const res = await uploadResume(file)
      setResume(res.text)
      setUploadName(res.filename)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  async function handleAnalyze(): Promise<void> {
    if (!canSubmit) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await analyzeResume({
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
        resume_text: resume,
        job_description: job,
        job_title: jobTitle,
        company,
      })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  function handleReset(): void {
    setResult(null)
    setError(null)
    setResume('')
    setJob('')
    setJobTitle('')
    setCompany('')
    setUploadName('')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <LoadingOverlay label="Analyzing resume against job description..." />
        <SkeletonAnalyzer />
      </div>
    )
  }

  if (result) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          <ResultBlock label="ATS Score" value={`${result.ats_score}/100`} />
          <ResultBlock label="Job Match" value={`${result.match_score}%`} />
          <ResultBlock label="Interview" value={`${result.hire_probability}%`} />
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(52,211,153,0.10)',
            border: '1px solid rgba(52,211,153,0.25)',
            color: 'var(--text)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#10a16e' }}>
            <Check className="w-4 h-4" /> AI Verdict
          </div>
          <p className="text-sm leading-relaxed">{result.overall_summary}</p>
        </div>

        {result.strengths.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Strengths
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#10a16e' }} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
            Matched Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.matched_skills.map((s) => (
              <span key={s} style={chipStyle('rgba(52,211,153,0.10)', '#10a16e')}>{s}</span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
            Missing Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missing_skills.map((s) => (
              <span key={s} style={chipStyle('rgba(251,113,133,0.10)', '#dc2655')}>{s}</span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
            Detailed Match
          </h3>
          <div className="flex flex-col gap-2.5">
            <BarRow label="Technical Skills" percent={result.match_score} color="linear-gradient(90deg, #3b5dbf, #5b7def)" />
            <BarRow label="Experience Depth" percent={Math.max(0, result.ats_score - 8)} color="linear-gradient(90deg, #2dd4bf, #5eead4)" />
            <BarRow label="Tone & Language" percent={Math.min(100, result.ats_score + 4)} color="linear-gradient(90deg, #5b7def, #8b9cff)" />
          </div>
        </section>

        {result.improvements.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Improvements
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.improvements.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-light)' }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.quick_wins.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Quick Wins
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.quick_wins.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#2dd4bf' }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.red_flags.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Recruiter Red Flags
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.red_flags.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#dc2655' }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.keyword_suggestions.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              ATS Keywords to Add
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.keyword_suggestions.map((s) => (
                <span key={s} style={chipStyle('rgba(91,126,239,0.10)', '#3b5dbf')}>{s}</span>
              ))}
            </div>
          </section>
        )}

        {result.salary_insight && (
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: 'rgba(59,93,191,0.06)',
              border: '1px solid rgba(59,93,191,0.16)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(59,93,191,0.18)', color: 'var(--primary)' }}
            >
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                Salary Insight
              </div>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{result.salary_insight}</p>
            </div>
          </div>
        )}

        {result.experience_gap && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Experience Gap
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.experience_gap}</p>
          </section>
        )}

        {result.education_match && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Education Match
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.education_match}</p>
          </section>
        )}

        <ExportAnalysisButtons result={result} filename={`analysis-${jobTitle || 'resume'}`} />

        <button
          type="button"
          onClick={handleReset}
          className="self-start rounded-full px-5 py-2 text-sm font-medium"
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border-strong)',
            cursor: 'pointer',
          }}
        >
          Analyze another resume
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
            Job Title (optional)
          </span>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
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
            placeholder="e.g. Vercel"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', outline: 'none' }}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Your Resume
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInput}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="rounded-lg p-4 cursor-pointer text-center transition-colors"
          style={{
            background: dragOver ? 'rgba(59,93,191,0.08)' : 'var(--glass-bg)',
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--glass-border)'}`,
          }}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Loader2 className="w-4 h-4 animate-spin" /> Extracting text…
            </div>
          ) : uploadName ? (
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
              <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="font-medium">{uploadName}</span>
              <span style={{ color: 'var(--text-dim)' }}>— {resume.trim().split(/\s+/).length} words extracted</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setUploadName('')
                  setResume('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="ml-1 rounded-full p-0.5 hover:bg-black/5"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                aria-label="Clear uploaded file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <UploadCloud className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span>
                <span className="font-medium" style={{ color: 'var(--primary)' }}>Click to upload</span> or drag & drop
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>PDF or Word (.docx)</span>
            </div>
          )}
        </div>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="…or paste resume text here"
          rows={5}
          className="w-full rounded-lg p-3 text-sm leading-relaxed resize-y"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {resume.trim().length} chars — minimum 40
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          Job Description
        </span>
        <textarea
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="Paste the job posting here…"
          rows={6}
          className="w-full rounded-lg p-3 text-sm leading-relaxed resize-y"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {job.trim().length} chars — minimum 40
        </span>
      </label>

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#dc2655' }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleAnalyze()}
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
          transition: 'all 0.25s ease',
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Now
          </>
        )}
      </button>
    </div>
  )
}