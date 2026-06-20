import { motion } from 'motion/react'
import { Sparkles, Moon, Sun, Search } from 'lucide-react'
import type { ToolId } from '../types'
import { useTheme } from '../lib/useTheme'

interface NavItemProps {
  label: string
  tool: ToolId
  onAction: (id: ToolId) => void
}

function NavItem({ label, tool, onAction }: NavItemProps) {
  return (
    <li
      style={{
        color: 'var(--text-muted)',
        transition: 'color 0.3s var(--ease-out-expo)',
        listStyle: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
    >
      <button
        type="button"
        onClick={() => onAction(tool)}
        aria-label={`Open ${label} tool`}
        style={{
          color: 'inherit',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          font: 'inherit',
          fontWeight: 500,
        }}
      >
        {label}
      </button>
    </li>
  )
}

interface NavbarProps {
  onAction: (id: ToolId) => void
  onCommandPalette: () => void
}

export default function Navbar({ onAction, onCommandPalette }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  return (
    <nav
      aria-label="Primary"
      className="flex items-center justify-between py-4 px-4 md:py-6 md:px-10 w-full relative z-10"
      style={{
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(30,50,90,0.04)',
      }}
    >
      <a
        href="/"
        className="flex items-center gap-3"
        aria-label="AI Career Suite home"
        style={{ textDecoration: 'none' }}
      >
        <div
          aria-hidden="true"
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(59,93,191,0.15), rgba(45,212,191,0.1))',
            border: '1px solid rgba(59,93,191,0.2)',
            color: 'var(--primary)',
          }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <span
          className="hidden sm:inline font-semibold text-lg tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          AI Career Suite
        </span>
      </a>

      <ul className="hidden md:flex items-center gap-5 text-sm font-medium" role="list">
        <NavItem label="Analyzer" tool="analyzer" onAction={onAction} />
        <NavItem label="Letters" tool="letters" onAction={onAction} />
        <NavItem label="Interview" tool="interview" onAction={onAction} />
        <NavItem label="Builder" tool="builder" onAction={onAction} />
        <NavItem label="Copilot" tool="copilot" onAction={onAction} />
        <NavItem label="Salary" tool="salary" onAction={onAction} />
        <NavItem label="Tracker" tool="tracker" onAction={onAction} />
        <NavItem label="Compare" tool="compare" onAction={onAction} />
        <NavItem label="Docs" tool="docs" onAction={onAction} />
      </ul>

      <div className="flex-1 md:flex-none md:w-fit flex md:justify-end justify-end items-center gap-2">
        <button
          type="button"
          onClick={onCommandPalette}
          aria-label="Open command palette"
          className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"
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
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick switch</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction('analyzer')}
          aria-label="Get started with AI Career Suite"
          className="flex items-center rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(59,93,191,0.15)',
            border: 'none',
            cursor: 'pointer',
            font: 'inherit',
            fontWeight: 500,
          }}
        >
          <span className="text-xs md:text-sm">Get Started</span>
        </motion.button>
      </div>
    </nav>
  )
}
