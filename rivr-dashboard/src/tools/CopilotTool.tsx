import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, Loader2, Send } from 'lucide-react'
import SettingsPanel from '../components/SettingsPanel'
import ResumeUpload from '../components/ResumeUpload'
import { ExportTextButtons } from '../components/ExportButtons'
import { TypingDots } from '../components/Skeleton'
import { useSettings } from '../lib/useSettings'
import { chat, type ChatMessage } from '../lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  pending?: boolean
}

const SUGGESTED: string[] = [
  'Review this bullet for a Senior Frontend resume: "Improved the React app performance."',
  'How do I negotiate a 15% higher offer without losing it?',
  'Walk me through a mock behavioral interview.',
  'Rewrite my LinkedIn headline for a Staff Engineer role.',
]

const SYSTEM_PROMPT = `You are an expert career coach. You help with resume bullet rewrites, salary negotiation, mock interviews, LinkedIn optimization, and general career strategy.

Be specific, actionable, and concise. Use formatting (bullet points, numbered lists) where helpful. If asked to run a mock interview, act as the interviewer and ask one question at a time.`

let messageCounter = 0

function nextId(prefix: string): string {
  messageCounter += 1
  return `${prefix}-${messageCounter}`
}

export default function CopilotTool(): ReactElement {
  const { settings } = useSettings()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hey! I'm your AI career coach. Share a resume bullet, paste an offer, or ask me to run a mock interview. What would you like to work on first?",
    },
  ])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeContext, setResumeContext] = useState('')
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const listEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, pending])

  async function send(prompt: string): Promise<void> {
    const trimmed = prompt.trim()
    if (!trimmed || pending) return

    const userMsg: Message = { id: nextId('u'), role: 'user', content: trimmed }
    const assistantId = nextId('a')
    const pendingMsg: Message = { id: assistantId, role: 'assistant', content: '', pending: true }

    setMessages((prev) => [...prev, userMsg, pendingMsg])
    setDraft('')
    setPending(true)
    setError(null)

    const history: ChatMessage[] = [...messages, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const assistantText = await chat({
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
        system: resumeContext.trim().length > 40
          ? `${SYSTEM_PROMPT}\n\nThe candidate's resume is provided below. Reference it when giving advice:\n${resumeContext.slice(0, 3000)}`
          : SYSTEM_PROMPT,
        messages: history,
        temperature: 0.7,
      })

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: assistantText, pending: false } : m
        )
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Chat request failed'
      setError(msg)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Sorry, I hit an error: ${msg}`, pending: false }
            : m
        )
      )
    } finally {
      setPending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(draft)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <SettingsPanel compact />

      {showResumeUpload && (
        <ResumeUpload
          label="Resume Context (optional - coach will reference it)"
          placeholder="...or paste resume text here"
          rows={3}
          value={resumeContext}
          onChange={setResumeContext}
        />
      )}
      <button
        type="button"
        onClick={() => setShowResumeUpload((v) => !v)}
        className="self-start text-xs font-medium rounded-full px-3 py-1.5"
        style={{
          background: resumeContext.trim().length > 40 ? 'rgba(52,211,153,0.10)' : 'var(--glass-bg)',
          color: resumeContext.trim().length > 40 ? '#10a16e' : 'var(--text-muted)',
          border: `1px solid ${resumeContext.trim().length > 40 ? 'rgba(52,211,153,0.2)' : 'var(--glass-border)'}`,
          cursor: 'pointer',
        }}
      >
        {resumeContext.trim().length > 40 ? 'Resume attached' : '+ Attach resume'}
      </button>

      <div
        className="flex-1 rounded-2xl p-4 overflow-y-auto flex flex-col gap-3 min-h-[320px]"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                  color: m.role === 'user' ? '#fff' : 'var(--primary)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                }}
              >
                {m.role === 'user' ? (
                  <span className="text-xs font-semibold">You</span>
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className="rounded-2xl px-4 py-2.5 max-w-[78%]"
                style={{
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                }}
              >
                {m.pending ? (
                  <TypingDots />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={listEndRef} />
      </div>

      {messages.filter((m) => !m.pending && m.content).length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Export conversation
          </span>
          <ExportTextButtons
            title="AI Career Coach - Conversation"
            subtitle={new Date().toLocaleString()}
            body={messages
              .filter((m) => !m.pending && m.content)
              .map((m) => `${m.role === 'user' ? 'You' : 'Coach'}:\n${m.content}`)
              .join('\n\n---\n\n')}
            filename="career-coach-chat"
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#dc2655' }}>
          {error}
        </div>
      )}

      {!pending && messages.length <= 1 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-left"
              style={{
                background: 'var(--glass-bg)',
                color: 'var(--text-muted)',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                maxWidth: '100%',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your career coach anything…"
          rows={2}
          className="flex-1 rounded-xl p-3 text-sm leading-relaxed resize-none"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => void send(draft)}
          disabled={!draft.trim() || pending}
          className="rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0"
          style={{
            background: draft.trim() && !pending
              ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
              : 'rgba(30,50,90,0.06)',
            color: draft.trim() && !pending ? '#fff' : 'var(--text-dim)',
            border: 'none',
            cursor: draft.trim() && !pending ? 'pointer' : 'not-allowed',
          }}
          aria-label="Send message"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}