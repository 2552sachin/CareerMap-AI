import { motion } from 'motion/react'
import { ArrowLeft, Search } from 'lucide-react'
import { Link } from './Link'

export default function NotFound() {
  return (
    <div
      className="w-full min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col items-center text-center p-8 sm:p-12"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur-strong)',
          WebkitBackdropFilter: 'var(--glass-blur-strong)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-7xl sm:text-8xl font-semibold tracking-tight mb-2"
          style={{ color: 'var(--text)' }}
        >
          404
        </motion.h1>
        <h2
          className="text-xl sm:text-2xl font-semibold mb-2"
          style={{ color: 'var(--text)' }}
        >
          Page not found
        </h2>
        <p
          className="text-sm sm:text-base mb-8 max-w-md"
          style={{ color: 'var(--text-muted)' }}
        >
          The page you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full pl-3 pr-5 py-2 text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59,93,191,0.15)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="#search"
            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
            style={{
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              cursor: 'pointer',
            }}
          >
            <Search className="w-4 h-4" />
            Search
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
