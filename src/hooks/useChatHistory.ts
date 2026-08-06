import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ChatEntry, ChatTone } from '../lib/chat'

export interface Conversation {
  id: string
  title: string
  messages: ChatEntry[]
  tone: ChatTone
  diagnostic: boolean
  createdAt: number
  updatedAt: number
  pinned: boolean
}

const STORAGE_KEY = 'sailtrim-chats'
const ACTIVE_KEY = 'sailtrim-active-chat'

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (c: unknown) =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as Conversation).id === 'string' &&
        Array.isArray((c as Conversation).messages),
    )
  } catch {
    return []
  }
}

function saveConversations(chats: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {
    // localStorage full — silently fail
  }
}

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY) || null
  } catch {
    return null
  }
}

function saveActiveId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_KEY, id)
    } else {
      localStorage.removeItem(ACTIVE_KEY)
    }
  } catch {
    // silently fail
  }
}

let uidCounter = Date.now()
function generateId(): string {
  return `chat-${(++uidCounter).toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function autoTitle(messages: ChatEntry[]): string {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return ''
  return firstUser.content.slice(0, 60).replace(/\n/g, ' ').trim()
}

export function useChatHistory() {
  const [chats, setChats] = useState<Conversation[]>(() => loadConversations())
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveId())

  useEffect(() => {
    saveConversations(chats)
  }, [chats])

  useEffect(() => {
    saveActiveId(activeId)
  }, [activeId])

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })
  }, [chats])

  const activeChat = useMemo(() => {
    if (!activeId) return null
    return chats.find((c) => c.id === activeId) || null
  }, [chats, activeId])

  const createChat = useCallback(
    (tone: ChatTone = 'casual', diagnostic: boolean = false): string => {
      const id = generateId()
      const now = Date.now()
      const chat: Conversation = {
        id,
        title: '',
        messages: [],
        tone,
        diagnostic,
        createdAt: now,
        updatedAt: now,
        pinned: false,
      }
      setChats((prev) => [...prev, chat])
      setActiveId(id)
      return id
    },
    [],
  )

  const updateMessages = useCallback(
    (id: string, messages: ChatEntry[]) => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const title = c.title || autoTitle(messages)
          return { ...c, messages, title, updatedAt: Date.now() }
        }),
      )
    },
    [],
  )

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id)
      return next
    })
    setActiveId((prev) => {
      if (prev === id) {
        const remaining = chats.filter((c) => c.id !== id)
        const nextId = remaining.length > 0 ? remaining[0].id : null
        return nextId
      }
      return prev
    })
  }, [chats])

  const clearAllChats = useCallback(() => {
    setChats([])
    setActiveId(null)
  }, [])

  const pinChat = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    )
  }, [])

  const renameChat = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    )
  }, [])

  const exportChat = useCallback((id: string): string | null => {
    const chat = chats.find((c) => c.id === id)
    if (!chat || chat.messages.length === 0) return null
    const lines: string[] = []
    lines.push(`=== ${chat.title || 'SailTrim Chat'} ===`)
    lines.push(`Date: ${new Date(chat.updatedAt).toLocaleString()}`)
    lines.push('')
    for (const msg of chat.messages) {
      const label = msg.role === 'user' ? 'You' : 'Skipper'
      lines.push(`[${label}] ${msg.content}`)
      lines.push('')
    }
    return lines.join('\n')
  }, [chats])

  const clearChat = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, messages: [], title: '', updatedAt: Date.now() } : c,
      ),
    )
  }, [])

  const updateSettings = useCallback(
    (id: string, settings: { tone?: ChatTone; diagnostic?: boolean }) => {
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...settings, updatedAt: Date.now() } : c)),
      )
    },
    [],
  )

  const hasAnyChats = chats.length > 0

  return {
    chats: sortedChats,
    activeChat,
    activeId,
    hasAnyChats,
    createChat,
    updateMessages,
    deleteChat,
    clearAllChats,
    clearChat,
    updateSettings,
    pinChat,
    renameChat,
    exportChat,
    setActiveId,
    setChats,
  }
}
