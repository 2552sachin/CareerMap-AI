import { useRef, useState, useCallback } from 'react'
import type { ReactElement, DragEvent, CSSProperties } from 'react'
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react'
import { uploadResume } from '../lib/api'

interface ResumeUploadProps {
  label?: string
  placeholder?: string
  rows?: number
  value: string
  onChange: (text: string) => void
  onUploadNameChange?: (name: string) => void
  style?: CSSProperties
}

export default function ResumeUpload({
  label = 'Your Resume',
  placeholder = '...or paste resume text here',
  rows = 4,
  value,
  onChange,
  onUploadNameChange,
  style,
}: ResumeUploadProps): ReactElement {
  const [uploading, setUploading] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File): Promise<void> => {
      const ext = file.name.toLowerCase().split('.').pop() ?? ''
      if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
        setError('Only .pdf, .docx, or .doc files are supported.')
        return
      }
      setUploading(true)
      setError(null)
      try {
        const res = await uploadResume(file)
        onChange(res.text)
        setUploadName(res.filename)
        onUploadNameChange?.(res.filename)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [onChange, onUploadNameChange],
  )

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  function clearUpload(): void {
    setUploadName('')
    onChange('')
    onUploadNameChange?.('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const labelStyle: CSSProperties = {
    color: 'var(--text-dim)',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div className="flex flex-col gap-1.5" style={style}>
      <span className="text-xs font-semibold uppercase tracking-wider" style={labelStyle}>
        {label}
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileInput}
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="rounded-lg p-4 cursor-pointer text-center transition-colors"
        style={{
          background: dragOver ? 'rgba(59,93,191,0.08)' : 'var(--glass-bg)',
          border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--glass-border)'}`,
        }}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-4 h-4 animate-spin" /> Extracting text...
          </div>
        ) : uploadName ? (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
            <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="font-medium">{uploadName}</span>
            <span style={{ color: 'var(--text-dim)' }}> - {value.trim().split(/\s+/).filter(Boolean).length} words extracted</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clearUpload()
              }}
              className="ml-1 rounded-full p-0.5"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
              aria-label="Clear uploaded file"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            <UploadCloud className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <span>
              <span className="font-medium" style={{ color: 'var(--primary)' }}>Click to upload</span> or drag &amp; drop
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>PDF, Word (.docx, .doc)</span>
          </div>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg p-3 text-sm leading-relaxed resize-y"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text)',
          outline: 'none',
        }}
      />
      {error && (
        <span className="text-[11px]" style={{ color: '#dc2655' }}>
          {error}
        </span>
      )}
    </div>
  )
}