import { useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import Navbar from './Navbar'
import HeroBadge from './HeroBadge'
import FeatureCards from './FeatureCards'
import DropdownMenu from './DropdownMenu'
import Tools from './Tools'
import CommandPalette from './CommandPalette'
import OnboardingTour from './OnboardingTour'
import { useTheme } from '../lib/useTheme'
import type { ToolId } from '../types'

const KEY_TO_TOOL: Record<string, ToolId> = {
  '1': 'analyzer',
  '2': 'letters',
  '3': 'interview',
  '4': 'builder',
  '5': 'copilot',
  '6': 'salary',
  '7': 'tracker',
  '8': 'compare',
  d: 'docs',
}

export default function Hero() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { toggleTheme } = useTheme()
  const open = useCallback((id: ToolId) => setActiveTool(id), [])
  const close = useCallback(() => setActiveTool(null), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const target = e.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
        return
      }

      if (paletteOpen || isTyping) return

      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        toggleTheme()
        return
      }

      const toolId = KEY_TO_TOOL[e.key.toLowerCase()]
      if (toolId) {
        e.preventDefault()
        setActiveTool(toolId)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [paletteOpen, toggleTheme])

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center p-3 md:p-5"
      style={{ background: 'var(--bg)' }}
    >
      <section
        aria-label="AI Career Suite"
        className="relative w-full max-w-[1536px] min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] rounded-2xl sm:rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex flex-col items-center"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur-strong)',
          WebkitBackdropFilter: 'var(--glass-blur-strong)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(59,93,191,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(45,212,191,0.04) 0%, transparent 50%), radial-gradient(ellipse at 10% 100%, rgba(91,141,239,0.04) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,93,191,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{ x: [0, 80, 0], y: [0, 40, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '8%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{ x: [0, -60, 0], y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,141,239,0.05) 0%, transparent 70%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{ x: [-50, 50, -50], y: [20, -20, 20], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        <div className="relative z-10 w-full flex flex-col items-center">
          <Navbar onAction={open} onCommandPalette={() => setPaletteOpen(true)} />

          <div className="w-full flex flex-col items-center pt-4 sm:pt-8 md:pt-14 px-4 sm:px-6 text-center max-w-4xl">
            <HeroBadge />

            <motion.h1
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-semibold mb-2 tracking-tight leading-[1.05]"
              style={{ color: 'var(--text)' }}
            >
              AI Career Suite
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal"
              style={{ color: 'var(--text-muted)' }}
            >
              Talent Intelligence & Career Planning — analyze resumes, draft letters, ace interviews, and let AI guide every move.
            </motion.p>
          </div>

          <FeatureCards onOpen={open} />
          <DropdownMenu onOpen={open} />
        </div>
      </section>

      <Tools openId={activeTool} onClose={close} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenTool={open} />
      <OnboardingTour />
    </div>
  )
}
