import type { ReactElement } from 'react'
import { motion } from 'motion/react'

export function ShimmerBlock({ className = '', style }: { className?: string; style?: React.CSSProperties }): ReactElement {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--glass-bg) 25%, rgba(59,93,191,0.06) 50%, var(--glass-bg) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBlock key={i} style={{ height: '12px', width: `${100 - i * 15}%` }} />
      ))}
    </div>
  )
}

export function SkeletonScoreCard(): ReactElement {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="flex items-center justify-between">
        <ShimmerBlock style={{ height: '14px', width: '80px' }} />
        <ShimmerBlock style={{ height: '28px', width: '28px', borderRadius: '50%' }} />
      </div>
      <ShimmerBlock style={{ height: '32px', width: '60px' }} />
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonAnalyzer(): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonScoreCard />
        <SkeletonScoreCard />
        <SkeletonScoreCard />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-5 flex flex-col gap-2.5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <ShimmerBlock style={{ height: '14px', width: '100px' }} />
            <SkeletonText lines={4} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonLetter(): ReactElement {
  return (
    <div className="rounded-xl p-6 flex flex-col gap-3" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <ShimmerBlock style={{ height: '16px', width: '200px' }} />
      <ShimmerBlock style={{ height: '12px', width: '100%' }} />
      <ShimmerBlock style={{ height: '12px', width: '95%' }} />
      <ShimmerBlock style={{ height: '12px', width: '98%' }} />
      <ShimmerBlock style={{ height: '12px', width: '85%' }} />
      <ShimmerBlock style={{ height: '12px', width: '90%' }} />
      <ShimmerBlock style={{ height: '12px', width: '60%' }} />
    </div>
  )
}

export function LoadingOverlay({ label }: { label?: string }): ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-12"
    >
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '3px solid var(--glass-border)' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ borderTop: '3px solid var(--primary)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {label && (
        <motion.p
          className="text-sm font-medium"
          style={{ color: 'var(--text-muted)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {label}
        </motion.p>
      )}
    </motion.div>
  )
}

export function TypingDots(): ReactElement {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--text-muted)' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}