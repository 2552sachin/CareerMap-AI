import { useState } from 'react'
import type { ReactElement } from 'react'
import { Download, FileText, File as FileIcon, Loader2, Files } from 'lucide-react'
import { exportDocument, downloadBlob, exportAnalysis, type AnalysisResult } from '../lib/api'

interface ExportButtonsProps {
  title: string
  body: string
  subtitle?: string
  filename?: string
}

export function ExportTextButtons({ title, body, subtitle, filename = 'document' }: ExportButtonsProps): ReactElement {
  const [busy, setBusy] = useState<'docx' | 'pdf' | 'both' | null>(null)

  async function handleExport(format: 'docx' | 'pdf'): Promise<void> {
    setBusy(format)
    try {
      const blob = await exportDocument({ title, body, subtitle, format })
      downloadBlob(blob, `${filename}.${format}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed'
      window.alert(`Export failed: ${msg}`)
    } finally {
      setBusy(null)
    }
  }

  async function handleExportBoth(): Promise<void> {
    setBusy('both')
    try {
      const docxBlob = await exportDocument({ title, body, subtitle, format: 'docx' })
      downloadBlob(docxBlob, `${filename}.docx`)
      const pdfBlob = await exportDocument({ title, body, subtitle, format: 'pdf' })
      downloadBlob(pdfBlob, `${filename}.pdf`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed'
      window.alert(`Export failed: ${msg}`)
    } finally {
      setBusy(null)
    }
  }

  const btnStyle = (format: 'docx' | 'pdf' | 'both'): React.CSSProperties => ({
    background: format === 'both' ? 'var(--primary)' : 'var(--glass-bg)',
    color: format === 'both' ? '#fff' : 'var(--text-muted)',
    border: `1px solid ${format === 'both' ? 'var(--primary)' : 'var(--glass-border)'}`,
    cursor: busy ? 'wait' : 'pointer',
    opacity: busy && busy !== format ? 0.5 : 1,
  })

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void handleExport('docx')}
        disabled={busy !== null}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
        style={btnStyle('docx')}
      >
        {busy === 'docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        DOCX
      </button>
      <button
        type="button"
        onClick={() => void handleExport('pdf')}
        disabled={busy !== null}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
        style={btnStyle('pdf')}
      >
        {busy === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileIcon className="w-3.5 h-3.5" />}
        PDF
      </button>
      <button
        type="button"
        onClick={() => void handleExportBoth()}
        disabled={busy !== null}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
        style={btnStyle('both')}
      >
        {busy === 'both' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Files className="w-3.5 h-3.5" />}
        Both
      </button>
    </div>
  )
}

interface AnalysisExportButtonsProps {
  result: AnalysisResult
  filename?: string
}

export function ExportAnalysisButtons({ result, filename = 'analysis' }: AnalysisExportButtonsProps): ReactElement {
  const [busy, setBusy] = useState<'docx' | 'pdf' | 'both' | null>(null)

  async function handleExport(format: 'docx' | 'pdf'): Promise<void> {
    setBusy(format)
    try {
      const blob = await exportAnalysis({ result, format })
      downloadBlob(blob, `${filename}.${format}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed'
      window.alert(`Export failed: ${msg}`)
    } finally {
      setBusy(null)
    }
  }

  async function handleExportBoth(): Promise<void> {
    setBusy('both')
    try {
      const docxBlob = await exportAnalysis({ result, format: 'docx' })
      downloadBlob(docxBlob, `${filename}.docx`)
      const pdfBlob = await exportAnalysis({ result, format: 'pdf' })
      downloadBlob(pdfBlob, `${filename}.pdf`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed'
      window.alert(`Export failed: ${msg}`)
    } finally {
      setBusy(null)
    }
  }

  const btnStyle = (format: 'docx' | 'pdf' | 'both'): React.CSSProperties => ({
    background: format === 'both' ? 'var(--primary)' : 'var(--glass-bg)',
    color: format === 'both' ? '#fff' : 'var(--text-muted)',
    border: `1px solid ${format === 'both' ? 'var(--primary)' : 'var(--glass-border)'}`,
    cursor: busy ? 'wait' : 'pointer',
    opacity: busy && busy !== format ? 0.5 : 1,
  })

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void handleExport('docx')}
        disabled={busy !== null}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
        style={btnStyle('docx')}
      >
        {busy === 'docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        DOCX
      </button>
      <button
        type="button"
        onClick={() => void handleExport('pdf')}
        disabled={busy !== null}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
        style={btnStyle('pdf')}
      >
        {busy === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        PDF
      </button>
      <button
        type="button"
        onClick={() => void handleExportBoth()}
        disabled={busy !== null}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
        style={btnStyle('both')}
      >
        {busy === 'both' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Files className="w-3.5 h-3.5" />}
        Both
      </button>
    </div>
  )
}