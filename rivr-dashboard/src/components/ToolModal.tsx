import { type ReactNode, useEffect, useId, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import HistorySidebar from './HistorySidebar'

interface ToolModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon: ReactNode
  children: ReactNode
  maxWidth?: string
}

export default function ToolModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-2xl',
}: ToolModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousActiveRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'

    const focusFirst = (): void => {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables && focusables.length > 0) {
        focusables[0].focus()
        return
      }
      dialogRef.current?.focus()
    }

    const t = window.setTimeout(focusFirst, 80)

    function handleEscape(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      window.clearTimeout(t)
      previousActiveRef.current?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          style={{ background: 'rgba(30,50,90,0.18)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-2xl md:rounded-[2rem] overflow-hidden`}
            style={{
              background: 'var(--surface)',
              backdropFilter: 'var(--glass-blur-strong)',
              WebkitBackdropFilter: 'var(--glass-blur-strong)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-xl), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            <header
              className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b relative"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(59,93,191,0.08)',
                    border: '1px solid rgba(59,93,191,0.12)',
                    color: 'var(--primary)',
                  }}
                >
                  {icon}
                </div>
                <div className="min-w-0">
                  <h2 id={titleId} className="text-lg sm:text-xl font-semibold leading-tight" style={{ color: 'var(--text)' }}>
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(30,50,90,0.04)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(30,50,90,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59,93,191,0.08)'
                  e.currentTarget.style.color = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(30,50,90,0.04)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <X className="w-4 h-4" />
              </button>
              <HistorySidebar />
            </header>

            <div className="overflow-y-auto flex-1 p-5 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
