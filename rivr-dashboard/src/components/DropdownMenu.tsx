import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronDown,
  BookOpen,
  Database,
  Shield,
  GitBranch,
  Cpu,
  FileText,
  HelpCircle,
  Rocket,
  Wrench,
  Code2,
  type LucideIcon,
} from 'lucide-react'
import type { ToolId } from '../types'

interface MenuItem {
  icon: LucideIcon
  label: string
  description: string
  sectionId?: string
}

interface MenuGroup {
  trigger: string
  items: MenuItem[]
}

const MENU_GROUPS: MenuGroup[] = [
  {
    trigger: 'Resources',
    items: [
      { icon: BookOpen, label: 'Documentation', description: 'Full setup & usage guide', sectionId: 'overview' },
      { icon: Wrench, label: 'Tools Guide', description: 'What each tool does & how to use it', sectionId: 'tools' },
      { icon: Code2, label: 'API Reference', description: 'All endpoints with request & response schemas', sectionId: 'api' },
      { icon: HelpCircle, label: 'FAQ', description: '12 common questions answered', sectionId: 'faq' },
    ],
  },
  {
    trigger: 'Stack',
    items: [
      { icon: Cpu, label: 'AI Providers', description: '17 providers · 300+ models · API key links', sectionId: 'providers' },
      { icon: Database, label: 'Database', description: 'SQLite local-first storage', sectionId: 'overview' },
      { icon: Shield, label: 'Privacy', description: 'Data stays on your machine', sectionId: 'overview' },
      { icon: Rocket, label: 'Setup Guide', description: '5 steps to run locally', sectionId: 'setup' },
    ],
  },
  {
    trigger: 'Open Source',
    items: [
      { icon: GitBranch, label: 'GitHub Repo', description: 'View source, issues & PRs', sectionId: 'overview' },
      { icon: FileText, label: 'Changelog', description: 'Latest releases & features', sectionId: 'overview' },
      { icon: BookOpen, label: 'Contributing', description: 'Submit improvements', sectionId: 'overview' },
    ],
  },
]

interface DropdownMenuProps {
  onOpen: (id: ToolId) => void
}

export default function DropdownMenu({ onOpen }: DropdownMenuProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const ref = useRef<HTMLElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }
    function handleEscape(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setOpenIndex(null)
        buttonRefs.current[openIndex ?? -1]?.focus()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openIndex])

  return (
    <section
      ref={ref}
      id="resources"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-12"
      aria-labelledby="resources-heading"
    >
      <h2 id="resources-heading" className="sr-only">
        More Tools & References
      </h2>
      <div
        className="overflow-hidden"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        <div className="p-4 sm:p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
              More Tools & References
            </span>
            <span aria-live="polite" className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {openIndex === null ? 'Tap any menu to open' : 'Click outside to close'}
            </span>
          </div>
        </div>

        <div role="list">
          {MENU_GROUPS.map((group, groupIdx) => {
            const triggerId = `${baseId}-trigger-${groupIdx}`
            const panelId = `${baseId}-panel-${groupIdx}`
            const isOpen = openIndex === groupIdx

            return (
              <div key={group.trigger} role="listitem">
                <button
                  type="button"
                  ref={(el) => {
                    buttonRefs.current[groupIdx] = el
                  }}
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : groupIdx)}
                  className="w-full flex items-center justify-between p-4 sm:px-5 sm:py-4 transition-colors text-left"
                  style={{
                    background: isOpen ? 'rgba(59,93,191,0.04)' : 'transparent',
                    borderBottom:
                      groupIdx < MENU_GROUPS.length - 1 || isOpen
                        ? '1px solid var(--glass-border)'
                        : 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <span className="text-sm sm:text-base font-medium" style={{ color: 'var(--text)' }}>
                    {group.trigger}
                  </span>
                  <ChevronDown
                    className="w-4 h-4"
                    aria-hidden="true"
                    style={{
                      color: 'var(--text-muted)',
                      transition: 'transform 0.3s var(--ease-out-expo)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="p-3 sm:p-4 flex flex-col gap-1.5">
                        {group.items.map((item) => {
                          const Icon = item.icon
                          const handleClick = () => {
                            onOpen('docs')
                            setOpenIndex(null)
                            if (item.sectionId) {
                              setTimeout(() => {
                                const el = document.getElementById(item.sectionId!)
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }, 350)
                            }
                          }
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={handleClick}
                              className="flex items-start gap-3 p-3 rounded-lg transition-all text-left"
                              style={{
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                width: '100%',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59,93,191,0.06)'
                                e.currentTarget.style.borderColor = 'rgba(59,93,191,0.15)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--glass-bg)'
                                e.currentTarget.style.borderColor = 'var(--glass-border)'
                              }}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(59,93,191,0.12), rgba(45,212,191,0.08))',
                                  color: 'var(--primary)',
                                }}
                              >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                                  {item.label}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {item.description}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-center mt-6 text-xs" style={{ color: 'var(--text-dim)' }}>
        Crafted with care · Open Source · Privacy First
      </div>
    </section>
  )
}
