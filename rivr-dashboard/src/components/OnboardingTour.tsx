import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactElement } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, ChevronRight, ChevronLeft } from 'lucide-react'

const TOUR_STORAGE_KEY = 'ai-career-tour-completed'
const TOUR_DISMISSED_KEY = 'ai-career-tour-dismissed'

interface TourStep {
  title: string
  description: string
  highlight?: string
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to AI Career Suite',
    description: 'Your AI-powered toolkit for landing your next role. Analyze resumes, draft letters, prep for interviews, and more — all in one place.',
  },
  {
    title: 'Eight Powerful Tools',
    description: 'From Resume Analyzer to Salary Benchmarking and Job Tracker — each tool connects to 17+ AI providers. Pick what you need, when you need it.',
    highlight: 'features',
  },
  {
    title: 'Upload Your Resume',
    description: 'Every tool supports PDF and DOCX resume upload. Drop your file and let AI tailor its analysis, letters, and prep to your experience.',
  },
  {
    title: 'Export Everything',
    description: 'Download generated documents as Word (.docx) or PDF (.pdf). Your analysis, letters, and interview prep are always one click away.',
  },
  {
    title: 'Quick Switch with Cmd+K',
    description: 'Press Cmd+K (or Ctrl+K) anytime to open the command palette. Search tools, toggle theme, and navigate instantly.',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Press 1-8 to jump to any tool, D for docs, T to toggle dark mode. Everything is keyboard-first for maximum speed.',
  },
  {
    title: 'Dark Mode & PWA',
    description: 'Toggle dark mode with T or the navbar button. Install as a PWA for offline access — your data stays on your machine.',
  },
]

interface OnboardingTourProps {
  forceOpen?: boolean
}

export default function OnboardingTour({ forceOpen }: OnboardingTourProps): ReactElement | null {
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const shouldShow = useMemo(() => {
    if (dismissed) return false
    if (forceOpen) return true
    if (typeof localStorage === 'undefined') return false
    return !localStorage.getItem(TOUR_STORAGE_KEY) && !localStorage.getItem(TOUR_DISMISSED_KEY)
  }, [forceOpen, dismissed])

  const [visible, setVisible] = useState(shouldShow)

  useEffect(() => {
    if (!shouldShow) return
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [shouldShow])

  const close = useCallback(() => {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem(TOUR_DISMISSED_KEY, 'true')
  }, [])

  const complete = useCallback(() => {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }, [])

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      complete()
    }
  }, [step, complete])

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  useEffect(() => {
    if (!visible) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [visible, close, next, prev])

  if (!visible) return null

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[71] w-full max-w-sm rounded-2xl p-5"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--glass-bg)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              aria-label="Close tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(59,93,191,0.15), rgba(45,212,191,0.1))', color: 'var(--primary)' }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                Step {step + 1} of {STEPS.length}
              </span>
            </div>

            <div className="flex gap-1 mb-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full flex-1"
                  style={{
                    background: i <= step ? 'var(--primary)' : 'var(--glass-border)',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>

            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
              {current.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {current.description}
            </p>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prev}
                disabled={step === 0}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: step === 0 ? 'var(--text-dim)' : 'var(--text-muted)',
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                Esc to close
              </span>
              <button
                onClick={next}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
                {step === STEPS.length - 1 ? <Sparkles className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}