import { useCallback } from 'react'

const STORAGE_KEY = 'ai-career-tool-history'
const MAX_ENTRIES = 10

export interface HistoryEntry {
  toolId: string
  toolName: string
  label: string
  timestamp: number
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as HistoryEntry[]
  } catch { void 0 }
  return []
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch { void 0 }
}

export function useToolHistory() {
  const addEntry = useCallback((toolId: string, toolName: string, label: string) => {
    const entries = loadHistory()
    const filtered = entries.filter((e) => !(e.toolId === toolId && e.label === label))
    const newEntry: HistoryEntry = { toolId, toolName, label, timestamp: Date.now() }
    const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES)
    saveHistory(updated)
  }, [])

  const clearHistory = useCallback(() => {
    saveHistory([])
  }, [])

  return { addEntry, clearHistory, getHistory: loadHistory }
}