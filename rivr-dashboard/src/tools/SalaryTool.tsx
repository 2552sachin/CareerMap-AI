import { useState } from 'react'
import type { ReactElement } from 'react'
import { motion } from 'motion/react'
import { Loader2, DollarSign, TrendingUp, TrendingDown, MapPin, Briefcase } from 'lucide-react'
import SettingsPanel from '../components/SettingsPanel'
import { ExportTextButtons } from '../components/ExportButtons'
import { SkeletonLetter, LoadingOverlay } from '../components/Skeleton'
import { useSettings } from '../lib/useSettings'
import { generateText } from '../lib/api'

interface SalaryData {
  low: number
  median: number
  high: number
  currency: string
  summary: string
  factors: string[]
  negotiation: string[]
  marketTrend: string
}

function parseSalary(raw: string): SalaryData | null {
  const currencyMatch = raw.match(/\$|USD|EUR|GBP|INR/i)
  const currency = currencyMatch ? currencyMatch[0].replace('USD', '$') : '$'

  const lowMatch = raw.match(/low[^$0-9]*[$]?([\d,]+)/i)
  const medMatch = raw.match(/median[^$0-9]*[$]?([\d,]+)/i)
  const highMatch = raw.match(/high[^$0-9]*[$]?([\d,]+)/i)

  const low = lowMatch ? parseInt(lowMatch[1].replace(/,/g, ''), 10) : 0
  const median = medMatch ? parseInt(medMatch[1].replace(/,/g, ''), 10) : 0
  const high = highMatch ? parseInt(highMatch[1].replace(/,/g, ''), 10) : 0

  const summaryMatch = raw.match(/##\s*SUMMARY\s*([\s\S]*?)(?=##|$)/i)
  const factorsMatch = raw.match(/##\s*FACTORS\s*([\s\S]*?)(?=##|$)/i)
  const negotiationMatch = raw.match(/##\s*NEGOTIATION\s*([\s\S]*?)(?=##|$)/i)
  const trendMatch = raw.match(/##\s*TREND\s*([\s\S]*?)(?=##|$)/i)

  const factors = (factorsMatch?.[1] || '')
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)

  const negotiation = (negotiationMatch?.[1] || '')
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)

  return {
    low,
    median,
    high,
    currency,
    summary: summaryMatch?.[1]?.trim() || raw.slice(0, 500),
    factors,
    negotiation,
    marketTrend: trendMatch?.[1]?.trim() || 'Stable',
  }
}

function buildPrompt(role: string, location: string, experience: string, resume: string): string {
  return `You are a compensation expert. Provide salary benchmarking for the following role.

Role: ${role}
Location: ${location}
Experience Level: ${experience}
${resume ? `\nCandidate's resume summary (first 1500 chars):\n${resume.slice(0, 1500)}\n` : ''}

Respond in this EXACT format:

## SALARY RANGES
- Low: $XX,XXX
- Median: $XX,XXX
- High: $XX,XXX

## SUMMARY
A 2-3 sentence overview of the market rate and how the candidate's experience aligns.

## FACTORS
- Factor 1 that impacts salary
- Factor 2
- Factor 3
- Factor 4

## NEGOTIATION
- Negotiation tip 1
- Negotiation tip 2
- Negotiation tip 3

## TREND
1-2 sentences on whether salaries for this role are rising, falling, or stable.`
}

export default function SalaryTool(): ReactElement {
  const { settings } = useSettings()
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('Mid-level (3-5 years)')
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SalaryData | null>(null)
  const [rawOutput, setRawOutput] = useState('')

  const EXPERIENCE_LEVELS = [
    'Entry-level (0-2 years)',
    'Mid-level (3-5 years)',
    'Senior (6-10 years)',
    'Lead/Staff (10+ years)',
    'Executive (15+ years)',
  ]

  const canSubmit = role.trim().length > 1 && location.trim().length > 1 && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const content = await generateText({
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
        prompt: buildPrompt(role, location, experience, resumeText),
        temperature: 0.4,
        max_tokens: 1500,
      })
      setRawOutput(content)
      const parsed = parseSalary(content)
      if (parsed) setResult(parsed)
      else {
        setResult({
          low: 0, median: 0, high: 0, currency: '$',
          summary: content, factors: [], negotiation: [], marketTrend: 'N/A'
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate salary data')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setRawOutput('')
    setError(null)
    setRole('')
    setLocation('')
    setResumeText('')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <LoadingOverlay label="Researching market salary data..." />
        <SkeletonLetter />
      </div>
    )
  }

  if (result) {
    const maxBar = result.high || 1
    const barWidth = (val: number) => `${(val / maxBar) * 100}%`

    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
              Salary Benchmark
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(59,93,191,0.10)', color: 'var(--primary)', border: '1px solid rgba(59,93,191,0.18)' }}
            >
              {role} · {location}
            </span>
          </div>
          <button
            onClick={reset}
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            New Search
          </button>
        </div>

        {result.median > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <TrendingDown className="w-5 h-5 mx-auto mb-2" style={{ color: '#e0935b' }} />
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Low</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{result.currency}{result.low.toLocaleString()}</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: barWidth(result.low) }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ height: '100%', background: '#e0935b' }} />
              </div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <DollarSign className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Median</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{result.currency}{result.median.toLocaleString()}</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: barWidth(result.median) }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }} style={{ height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: '#2dd4bf' }} />
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>High</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{result.currency}{result.high.toLocaleString()}</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: barWidth(result.high) }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }} style={{ height: '100%', background: '#2dd4bf' }} />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Market Summary</h4>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.summary}</p>
        </div>

        {result.factors.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Key Factors</h4>
            <ul className="flex flex-col gap-1.5">
              {result.factors.map((f, i) => (
                <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.negotiation.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Negotiation Tips</h4>
            <ul className="flex flex-col gap-1.5">
              {result.negotiation.map((n, i) => (
                <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#2dd4bf' }} />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ExportTextButtons
          title={`Salary Benchmark: ${role}`}
          body={rawOutput}
          subtitle={`${location} · ${experience}`}
          filename={`salary-${role.toLowerCase().replace(/\s+/g, '-')}`}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel />

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(224,147,91,0.08)', border: '1px solid rgba(224,147,91,0.2)', color: '#e0935b' }}>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Role / Job Title</span>
          <div className="relative">
            <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Location</span>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Experience Level</span>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
          >
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Resume Text (optional — for personalized benchmark)</span>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text for a personalized salary assessment..."
            rows={4}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
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
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
        Benchmark Salary
      </button>
    </div>
  )
}