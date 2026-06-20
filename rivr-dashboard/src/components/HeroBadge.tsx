import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

export default function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex items-center gap-2 px-4 py-2 rounded-full mx-auto mb-3 w-fit"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
    >
      <Sparkles className="w-4 h-4" style={{ color: 'var(--primary-light)' }} />
      <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>AI-Powered Career Platform</span>
    </motion.div>
  )
}
