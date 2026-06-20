import { useState } from 'react'
import type { ReactElement } from 'react'
import { Loader2, GitCompareArrows, Check, X, Plus, Minus } from 'lucide-react'
import SettingsPanel from '../components/SettingsPanel'
import { ExportTextButtons } from '../components/ExportButtons'
import { SkeletonLetter, LoadingOverlay } from '../components/Skeleton'
import { useSettings } from '../lib/useSettings'
import { generateText } from '../lib/api'

interface DiffLine {
  type: 'same' | 'add' | 'remove'
  text: string
}

interface CompareResult {
  summary: string
  improvements: string[]
  regressions: string[]
  scoreBefore: number
  scoreAfter: number
  diff: DiffLine[]
}

function buildPrompt(before: string, after: string): string {
  return `You are a resume expert. Compare these two versions of a resume and provide a detailed diff analysis.

## BEFORE (Original Resume)
${before.slice(0, 4000)}

## AFTER (Revised Resume)
${after.slice(0, 4000)}

Respond in this EXACT format:

## SCORES
Before: XX/100
After: XX/100

## SUMMARY
2-3 sentences summarizing what changed and whether the revision is an improvement.

## IMPROVEMENTS
- Improvement 1
- Improvement 2
- Improvement 3

## REGRESSIONS
- Any regression 1
- Any regression 2
(If none, write "None identified")

## DIFF
Line-by-line comparison. Use this format:
+ Added line
- Removed line
  Unchanged line`
}

function parseDiff(raw: string): DiffLine[] {
  const diffMatch = raw.match(/##\s*DIFF\s*([\s\S]*?)$/i)
  if (!diffMatch) return []
  return diffMatch[1]
    .split('\n')
    .filter((l) => l.trim())
    .map((line) => {
      if (line.startsWith('+ ')) return { type: 'add' as const, text: line.slice(2) }
      if (line.startsWith('- ')) return { type: 'remove' as const, text: line.slice(2) }
      if (line.startsWith('  ')) return { type: 'same' as const, text: line.slice(2) }
      return { type: 'same' as const, text: line.trim() }
    })
}

function parseResult(raw: string): CompareResult {
  const scoresMatch = raw.match(/before[^0-9]*(\d+)/i)
  const afterScoreMatch = raw.match(/after[^0-9]*(\d+)/i)
  const summaryMatch = raw.match(/##\s*SUMMARY\s*([\s\S]*?)(?=##|$)/i)
  const improvementsMatch = raw.match(/##\s*IMPROVEMENTS\s*([\s\S]*?)(?=##|$)/i)
  const regressionsMatch = raw.match(/##\s*REGRESSIONS\s*([\s\S]*?)(?=##|$)/i)

  const improvements = (improvementsMatch?.[1] || '')
    .split('\n').map((l) => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  const regressions = (regressionsMatch?.[1] || '')
    .split('\n').map((l) => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)

  return {
    scoreBefore: scoresMatch ? parseInt(scoresMatch[1], 10) : 0,
    scoreAfter: afterScoreMatch ? parseInt(afterScoreMatch[1], 10) : 0,
    summary: summaryMatch?.[1]?.trim() || '',
    improvements,
    regressions,
    diff: parseDiff(raw),
  }
}

export default function ResumeCompareTool(): ReactElement {
  const { settings } = useSettings()
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [rawOutput, setRawOutput] = useState('')

  const canSubmit = before.trim().length > 40 && after.trim().length > 40 && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const content = await generateText({
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
        prompt: buildPrompt(before, after),
        temperature: 0.3,
        max_tokens: 2000,
      })
      setRawOutput(content)
      setResult(parseResult(content))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compare resumes')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setRawOutput('')
    setError(null)
    setBefore('')
    setAfter('')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <LoadingOverlay label="Comparing resume versions..." />
        <SkeletonLetter />
        <SkeletonLetter />
      </div>
    )
  }

  if (result) {
    const scoreDelta = result.scoreAfter - result.scoreBefore
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Comparison Result
          </span>
          <button
            onClick={reset}
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            New Comparison
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Before</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{result.scoreBefore}/100</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Change</p>
            <p className="text-xl font-bold flex items-center justify-center gap-1" style={{ color: scoreDelta >= 0 ? '#2dd4bf' : '#e0935b' }}>
              {scoreDelta >= 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              {Math.abs(scoreDelta)}
            </p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>After</p>
            <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{result.scoreAfter}/100</p>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Summary</h4>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.summary}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4" style={{ color: '#2dd4bf' }} />
              <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Improvements</h4>
            </div>
            <ul className="flex flex-col gap-1.5">
              {result.improvements.map((imp, i) => (
                <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#2dd4bf' }} />
                  {imp}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <X className="w-4 h-4" style={{ color: '#e0935b' }} />
              <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Regressions</h4>
            </div>
            <ul className="flex flex-col gap-1.5">
              {result.regressions.map((reg, i) => (
                <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#e0935b' }} />
                  {reg}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {result.diff.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Line-by-Line Diff</h4>
            <div className="font-mono text-xs flex flex-col gap-0.5 max-h-80 overflow-y-auto">
              {result.diff.map((line, i) => (
                <div
                  key={i}
                  className="px-2 py-0.5 rounded"
                  style={{
                    background: line.type === 'add' ? 'rgba(45,212,191,0.08)' : line.type === 'remove' ? 'rgba(224,147,91,0.08)' : 'transparent',
                    color: line.type === 'add' ? '#2dd4bf' : line.type === 'remove' ? '#e0935b' : 'var(--text-muted)',
                  }}
                >
                  <span className="select-none mr-2">
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                  </span>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <ExportTextButtons
          title="Resume Comparison"
          body={rawOutput}
          subtitle="Before vs After analysis"
          filename="resume-comparison"
        />
      </div>
    )
  }

  const textareaStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text)',
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel />

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(224,147,91,0.08)', border: '1px solid rgba(224,147,91,0.2)', color: '#e0935b' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Minus className="w-3.5 h-3.5" style={{ color: '#e0935b' }} />
            Before (Original)
          </span>
          <textarea
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            placeholder="Paste the original resume text..."
            rows={10}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
            style={textareaStyle}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Plus className="w-3.5 h-3.5" style={{ color: '#2dd4bf' }} />
            After (Revised)
          </span>
          <textarea
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            placeholder="Paste the revised resume text..."
            rows={10}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
            style={textareaStyle}
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium self-start"
        style={{
          background: canSubmit ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--glass-bg)',
          color: canSubmit ? '#fff' : 'var(--text-dim)',
          border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          boxShadow: canSubmit ? '0 2px 8px rgba(59,93,191,0.15)' : 'none',
          transition: 'all 0.3s var(--ease-out-expo)',
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompareArrows className="w-4 h-4" />}
        Compare Resumes
      </button>
    </div>
  )
}