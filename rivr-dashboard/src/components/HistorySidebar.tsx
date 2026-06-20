import { useState } from 'react'
import type { ReactElement } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Clock, Trash2, ChevronRight } from 'lucide-react'
import { loadHistory, type HistoryEntry } from '../lib/history'

interface HistorySidebarProps {
  onSelect?: (toolId: string) => void
}

export default function HistorySidebar({ onSelect }: HistorySidebarProps): ReactElement | null {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory())
  const [open, setOpen] = useState(false)

  if (entries.length === 0) return null

  function handleClear() {
    try { localStorage.removeItem('ai-career-tool-history') } catch { void 0 }
    setEntries([])
  }

  return (
    <div className="absolute top-2 right-2 z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
        }}
        aria-label="Toggle recent history"
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Recent</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-1 w-64 rounded-xl p-2 max-h-80 overflow-y-auto"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                Recent Activity
              </span>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--glass-bg)', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>

            {entries.map((entry, i) => (
              <button
                key={`${entry.toolId}-${entry.timestamp}-${i}`}
                onClick={() => {
                  onSelect?.(entry.toolId)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left group"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-bg)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                    {entry.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    {entry.toolName} · {timeAgo(entry.timestamp)}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-dim)' }} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}