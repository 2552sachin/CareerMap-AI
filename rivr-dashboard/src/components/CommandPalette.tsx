import { useEffect, useState, useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  FileSearch,
  Mail,
  MessageSquareQuote,
  FileText,
  Bot,
  DollarSign,
  KanbanSquare,
  GitCompareArrows,
  BookOpen,
  Moon,
  Sun,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { ToolId } from '../types'
import { useTheme } from '../lib/useTheme'

interface CommandItem {
  id: string
  label: string
  hint: string
  icon: typeof FileSearch
  action: () => void
  group: 'Tools' | 'Actions'
  keywords: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onOpenTool: (id: ToolId) => void
}

function CommandPaletteInner({ open, onClose, onOpenTool }: CommandPaletteProps): ReactElement {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const items = useMemo<CommandItem[]>(() => {
    const tools: CommandItem[] = [
      { id: 'analyzer', label: 'Resume Analyzer', hint: 'ATS score & job match', icon: FileSearch, action: () => onOpenTool('analyzer'), group: 'Tools', keywords: 'analyze ats score resume job match' },
      { id: 'letters', label: 'Smart Letters', hint: 'Cover letters & follow-ups', icon: Mail, action: () => onOpenTool('letters'), group: 'Tools', keywords: 'letter cover follow email linkedin' },
      { id: 'interview', label: 'Interview Prep', hint: 'Questions, STAR, negotiation', icon: MessageSquareQuote, action: () => onOpenTool('interview'), group: 'Tools', keywords: 'interview prep star questions negotiation' },
      { id: 'builder', label: 'Resume Builder', hint: 'Build ATS-optimized resume', icon: FileText, action: () => onOpenTool('builder'), group: 'Tools', keywords: 'build resume create ats' },
      { id: 'copilot', label: 'AI Copilot', hint: 'Career coach chat', icon: Bot, action: () => onOpenTool('copilot'), group: 'Tools', keywords: 'copilot chat coach ai' },
      { id: 'salary', label: 'Salary Benchmark', hint: 'Market salary data & negotiation', icon: DollarSign, action: () => onOpenTool('salary'), group: 'Tools', keywords: 'salary benchmark market compensation negotiation pay' },
      { id: 'tracker', label: 'Job Tracker', hint: 'Kanban application tracker', icon: KanbanSquare, action: () => onOpenTool('tracker'), group: 'Tools', keywords: 'job tracker kanban application wishlist offer' },
      { id: 'compare', label: 'Resume Compare', hint: 'Diff two resume versions', icon: GitCompareArrows, action: () => onOpenTool('compare'), group: 'Tools', keywords: 'compare diff resume before after revision' },
      { id: 'docs', label: 'Documentation', hint: 'Guides, API, providers, FAQ', icon: BookOpen, action: () => onOpenTool('docs'), group: 'Tools', keywords: 'docs documentation api guide faq help' },
    ]
    const actions: CommandItem[] = [
      { id: 'theme', label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', hint: 'Toggle theme', icon: theme === 'dark' ? Sun : Moon, action: () => toggleTheme(), group: 'Actions', keywords: 'theme dark light toggle mode' },
    ]
    return [...tools, ...actions]
  }, [onOpenTool, theme, toggleTheme])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.hint.toLowerCase().includes(q) ||
      item.keywords.includes(q)
    )
  }, [items, query])

  const clampedIndex = activeIndex >= filtered.length ? 0 : activeIndex

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = filtered[clampedIndex]
        if (item) {
          item.action()
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, filtered, clampedIndex, onClose])

  let currentGroup = ''

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '60vh',
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-dim)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools and actions..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
                style={{ color: 'var(--text)' }}
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--glass-bg)', color: 'var(--text-dim)', border: '1px solid var(--glass-border)' }}>
                ESC
              </kbd>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-dim)' }}>No results found</p>
              ) : (
                filtered.map((item, i) => {
                  const showGroup = item.group !== currentGroup
                  currentGroup = item.group
                  const Icon = item.icon
                  const isActive = i === clampedIndex
                  return (
                    <div key={item.id}>
                      {showGroup && (
                        <p className="text-[10px] font-bold uppercase tracking-wider px-2 pt-3 pb-1" style={{ color: 'var(--text-dim)' }}>
                          {item.group}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => { item.action(); onClose() }}
                        onMouseEnter={() => setActiveIndex(i)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                        style={{
                          background: isActive ? 'rgba(59,93,191,0.08)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive ? 'rgba(59,93,191,0.12)' : 'var(--glass-bg)',
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.hint}</p>
                        </div>
                        {isActive && (
                          <CornerDownLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        )}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t text-[11px]" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-dim)' }}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> select</span>
              </div>
              <span>AI Career Suite</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function CommandPalette({ open, onClose, onOpenTool }: CommandPaletteProps): ReactElement {
  return (
    <CommandPaletteInner
      key={open ? 'open' : 'closed'}
      open={open}
      onClose={onClose}
      onOpenTool={onOpenTool}
    />
  )
}