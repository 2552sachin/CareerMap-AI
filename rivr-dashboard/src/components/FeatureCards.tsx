import { useRef } from 'react'
import type { ReactElement } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  FileSearch,
  Mail,
  MessageSquareQuote,
  FileText,
  Bot,
  DollarSign,
  KanbanSquare,
  GitCompareArrows,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import type { ToolId } from '../types'

interface FeatureCardData {
  id: ToolId
  icon: LucideIcon
  title: string
  description: string
  cta: string
}

const FEATURES: FeatureCardData[] = [
  {
    id: 'analyzer',
    icon: FileSearch,
    title: 'Resume Analyzer',
    description: 'ATS score, job match, interview probability, red flags, salary insight',
    cta: 'Analyze Now',
  },
  {
    id: 'letters',
    icon: Mail,
    title: 'Smart Letters',
    description: 'Custom ATS-friendly cover letters, follow-ups, thank you notes, LinkedIn messages',
    cta: 'Draft Letter',
  },
  {
    id: 'interview',
    icon: MessageSquareQuote,
    title: 'Interview Prep',
    description: 'Role-specific questions, STAR stories, salary negotiation scripts',
    cta: 'Start Prep',
  },
  {
    id: 'builder',
    icon: FileText,
    title: 'Resume Builder',
    description: 'Build from scratch, rewrite for a job, LinkedIn profile optimizer',
    cta: 'Build Resume',
  },
  {
    id: 'copilot',
    icon: Bot,
    title: 'AI Copilot',
    description: 'Interactive career coach chat for rewrites, mock interviews, salary advice',
    cta: 'Open Copilot',
  },
  {
    id: 'salary',
    icon: DollarSign,
    title: 'Salary Benchmark',
    description: 'Market salary ranges, key factors, negotiation tips, and trend analysis',
    cta: 'Benchmark',
  },
  {
    id: 'tracker',
    icon: KanbanSquare,
    title: 'Job Tracker',
    description: 'Kanban board to track applications from wishlist to offer — stored locally',
    cta: 'Track Jobs',
  },
  {
    id: 'compare',
    icon: GitCompareArrows,
    title: 'Resume Compare',
    description: 'Diff two resume versions — score change, improvements, regressions, line-by-line',
    cta: 'Compare',
  },
]

interface FeatureCardsProps {
  onOpen: (id: ToolId) => void
}

function FeatureCard({ feature, index, onOpen }: { feature: FeatureCardData; index: number; onOpen: (id: ToolId) => void }) {
  const Icon = feature.icon
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const spotlightX = useSpring(mouseX, { stiffness: 200, damping: 25 })
  const spotlightY = useSpring(mouseY, { stiffness: 200, damping: 25 })
  const bgX = useTransform(spotlightX, (v) => `${v}%`)
  const bgY = useTransform(spotlightY, (v) => `${v}%`)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    mouseX.set(x)
    mouseY.set(y)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="p-6 flex flex-col gap-3 cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={() => onOpen(feature.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(feature.id)
        }
      }}
      aria-label={`Open ${feature.title} tool`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2)',
        transition: 'box-shadow 0.35s var(--ease-out-expo), border-color 0.35s var(--ease-out-expo)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            [bgX, bgY] as const,
            ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(59,93,191,0.12) 0%, transparent 50%)`
          ),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(59,93,191,0.04) 0%, transparent 60%)',
        }}
      />
      <motion.div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'rgba(59,93,191,0.08)',
          border: '1px solid rgba(59,93,191,0.12)',
          color: 'var(--primary)',
        }}
        whileHover={{ scale: 1.1, rotate: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Icon className="w-7 h-7" aria-hidden="true" />
      </motion.div>
      <h3
        className="text-lg font-semibold"
        style={{ color: 'var(--text)' }}
      >
        {feature.title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        {feature.description}
      </p>
      <motion.button
        type="button"
        aria-label={`${feature.cta}: ${feature.title}`}
        className="mt-auto flex items-center justify-center gap-2 rounded-full pl-3 pr-4 py-2 self-start text-sm font-medium"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(59,93,191,0.15)',
          transition: 'all 0.3s var(--ease-out-expo)',
        }}
        whileHover={{ scale: 1.04, boxShadow: '0 4px 16px rgba(59,93,191,0.3)' }}
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          e.stopPropagation()
          onOpen(feature.id)
        }}
      >
        {feature.cta}
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </motion.button>
    </motion.article>
  )
}

export default function FeatureCards({ onOpen }: FeatureCardsProps): ReactElement {
  return (
    <section
      id="features"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14"
      aria-labelledby="features-heading"
    >
      <div className="text-center mb-8 sm:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-medium"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)',
          }}
        >
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--primary)' }}
          />
          Analyze · Build · Succeed
        </motion.div>
        <motion.h2
          id="features-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          Eight Tools to Land Your Next Role
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base mt-2 max-w-xl mx-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          From resume analysis to interview prep — pick what you need, when you need it.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
        {FEATURES.map((feature, index) => (
          <div key={feature.id} role="listitem">
            <FeatureCard feature={feature} index={index} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  )
}
