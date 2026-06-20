import { useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Trash2, Briefcase, MapPin, Calendar, ExternalLink, ChevronRight } from 'lucide-react'

interface JobApplication {
  id: string
  company: string
  role: string
  location: string
  url: string
  status: 'wishlist' | 'applied' | 'phone' | 'onsite' | 'offer' | 'rejected'
  date: string
  notes: string
}

type Status = JobApplication['status']

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  wishlist: { label: 'Wishlist', color: '#7c8db5', bg: 'rgba(124,141,181,0.08)' },
  applied: { label: 'Applied', color: '#3b5dbf', bg: 'rgba(59,93,191,0.08)' },
  phone: { label: 'Phone Screen', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  onsite: { label: 'Interview', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  offer: { label: 'Offer', color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' },
  rejected: { label: 'Rejected', color: '#e0935b', bg: 'rgba(224,147,91,0.08)' },
}

const COLUMNS: Status[] = ['wishlist', 'applied', 'phone', 'onsite', 'offer', 'rejected']
const STORAGE_KEY = 'ai-career-job-tracker'

function loadJobs(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as JobApplication[]
  } catch { void 0 }
  return []
}

function saveJobs(jobs: JobApplication[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  } catch { void 0 }
}

export default function JobTrackerTool(): ReactElement {
  const [jobs, setJobs] = useState<JobApplication[]>(() => loadJobs())
  const [showForm, setShowForm] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Status | null>(null)

  const updateJobs = useCallback((newJobs: JobApplication[]) => {
    setJobs(newJobs)
    saveJobs(newJobs)
  }, [])

  function addJob(job: Omit<JobApplication, 'id' | 'date'>) {
    const newJob: JobApplication = {
      ...job,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    }
    updateJobs([newJob, ...jobs])
    setShowForm(false)
  }

  function deleteJob(id: string) {
    updateJobs(jobs.filter((j) => j.id !== id))
  }

  function moveJob(id: string, status: Status) {
    updateJobs(jobs.map((j) => (j.id === id ? { ...j, status } : j)))
  }

  function handleDrop(status: Status) {
    if (dragId) moveJob(dragId, status)
    setDragId(null)
    setDragOver(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {jobs.length} application{jobs.length !== 1 ? 's' : ''} tracked
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add Application'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <JobForm onAdd={addJob} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {COLUMNS.map((status) => {
          const config = STATUS_CONFIG[status]
          const colJobs = jobs.filter((j) => j.status === status)
          return (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); setDragOver(status) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(status)}
              className="rounded-xl p-3 min-h-[200px] flex flex-col gap-2"
              style={{
                background: dragOver === status ? config.bg : 'var(--glass-bg)',
                border: `1px solid ${dragOver === status ? config.color : 'var(--glass-border)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: config.bg, color: config.color }}>
                  {colJobs.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {colJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onDragStart={() => setDragId(job.id)}
                    onDragEnd={() => setDragId(null)}
                    onDelete={() => deleteJob(job.id)}
                  />
                ))}
                {colJobs.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text-dim)' }}>Drop here</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {jobs.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>No applications yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click "Add Application" to start tracking your job search</p>
        </div>
      )}
    </div>
  )
}

function JobCard({ job, onDragStart, onDragEnd, onDelete }: {
  job: JobApplication
  onDragStart: () => void
  onDragEnd: () => void
  onDelete: () => void
}): ReactElement {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-2.5 cursor-grab active:cursor-grabbing group"
      style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs font-semibold flex-1" style={{ color: 'var(--text)' }}>{job.role}</p>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
          aria-label="Delete application"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{job.company}</p>
      {job.location && (
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin className="w-3 h-3" style={{ color: 'var(--text-dim)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{job.location}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 mt-1.5">
        <Calendar className="w-3 h-3" style={{ color: 'var(--text-dim)' }} />
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {job.url && (
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="ml-auto" style={{ color: 'var(--primary)' }} aria-label="Open job posting">
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      {job.notes && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 mt-1.5 text-xs"
            style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            Notes
          </button>
          {expanded && (
            <p className="text-xs mt-1 p-2 rounded" style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}>
              {job.notes}
            </p>
          )}
        </>
      )}
    </motion.div>
  )
}

function JobForm({ onAdd }: { onAdd: (job: Omit<JobApplication, 'id' | 'date'>) => void }): ReactElement {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('wishlist')
  const [notes, setNotes] = useState('')

  function handleSubmit() {
    if (!company.trim() || !role.trim()) return
    onAdd({ company: company.trim(), role: role.trim(), location: location.trim(), url: url.trim(), status, notes: notes.trim() })
    setCompany(''); setRole(''); setLocation(''); setUrl(''); setStatus('wishlist'); setNotes('')
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text)',
  }

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company *" style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role *" style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Job URL" style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
      </div>
      <select value={status} onChange={(e) => setStatus(e.target.value as Status)} style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none">
        {COLUMNS.map((s) => (
          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
        ))}
      </select>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2} style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none resize-y" />
      <button
        onClick={handleSubmit}
        disabled={!company.trim() || !role.trim()}
        className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium self-start"
        style={{
          background: company.trim() && role.trim() ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--glass-bg)',
          color: company.trim() && role.trim() ? '#fff' : 'var(--text-dim)',
          border: 'none',
          cursor: company.trim() && role.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </div>
  )
}