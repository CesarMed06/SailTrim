import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Conversation } from '../hooks/useChatHistory'
import type { ChatTone } from '../lib/chat'

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  chats: Conversation[]
  activeId: string | null
  hasAnyChats: boolean
  onCreate: (tone: ChatTone, diagnostic: boolean) => string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  onRename: (id: string, title: string) => void
  onExport: (id: string) => string | null
}

export default function ChatSidebar({
  isOpen,
  onClose,
  chats,
  activeId,
  hasAnyChats,
  onCreate,
  onSelect,
  onDelete,
  onPin,
  onRename,
  onExport,
}: ChatSidebarProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const editRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editingId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const handleNewChat = useCallback(() => {
    onCreate('casual', false)
    onClose()
  }, [onCreate, onClose])

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id)
      onClose()
    },
    [onSelect, onClose],
  )

  const handleRenameStart = useCallback(
    (id: string, currentTitle: string) => {
      setEditingId(id)
      setEditTitle(currentTitle)
    },
    [],
  )

  const handleRenameSubmit = useCallback(
    (id: string) => {
      const trimmed = editTitle.trim()
      if (trimmed) {
        onRename(id, trimmed)
      }
      setEditingId(null)
    },
    [editTitle, onRename],
  )

  const handleExport = useCallback(
    (id: string) => {
      const text = onExport(id)
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedId(id)
          setTimeout(() => setCopiedId(null), 1800)
        })
      }
    },
    [onExport],
  )

  const formatDate = (ts: number) => {
    const now = Date.now()
    const diff = now - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('sidebar.justNow')
    if (mins < 60) return t('sidebar.minutesAgo', { count: mins })
    const hours = Math.floor(mins / 60)
    if (hours < 24) return t('sidebar.hoursAgo', { count: hours })
    const days = Math.floor(hours / 24)
    if (days < 7) return t('sidebar.daysAgo', { count: days })
    return new Date(ts).toLocaleDateString()
  }

  const modeBadge = (chat: Conversation) => {
    if (chat.diagnostic) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
          {t('sidebar.diagnosticBadge')}
        </span>
      )
    }
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
        {t('sidebar.questionsBadge')}
      </span>
    )
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-30 h-full w-[300px] bg-ocean-950/95 backdrop-blur-xl border-r border-ocean-800/30 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-ocean-800/20">
          <h2 className="text-sm font-bold text-sail-300 tracking-wide uppercase">
            {t('sidebar.title')}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              aria-label={t('sidebar.newChat')}
              className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 hover:text-cyan-300 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              onClick={onClose}
              aria-label={t('sidebar.close')}
              className="p-1.5 rounded-lg hover:bg-ocean-800/40 text-sail-500 hover:text-sail-300 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          <button
            onClick={handleNewChat}
            className="w-full text-left px-3 py-2.5 rounded-xl border border-dashed border-ocean-700/40 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-sail-500 hover:text-cyan-300 text-sm transition-all flex items-center gap-2"
          >
            <span className="text-base">+</span>
            {t('sidebar.newChat')}
          </button>

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative rounded-xl transition-all duration-200 ${
                chat.id === activeId
                  ? 'bg-cyan-500/10 border border-cyan-500/20'
                  : 'hover:bg-ocean-900/60 border border-transparent'
              }`}
            >
              {chat.pinned && (
                <span className="absolute top-1.5 right-1.5 text-[10px] text-amber-400/60">📌</span>
              )}

              <button
                onClick={() => handleSelect(chat.id)}
                className="w-full text-left px-3 pt-2.5 pb-1.5"
              >
                <div className="flex items-start gap-1.5">
                  {editingId === chat.id ? (
                    <input
                      ref={editRef}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRenameSubmit(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(chat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-ocean-900 border border-cyan-500/40 rounded-lg px-2 py-0.5 text-sm text-sail-200 outline-none"
                    />
                  ) : (
                    <span className="text-sm text-sail-300 font-medium truncate block leading-snug flex-1">
                      {chat.title || t('sidebar.untitled')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {modeBadge(chat)}
                  <span className="text-[10px] text-sail-600">
                    {formatDate(chat.updatedAt)}
                  </span>
                  <span className="text-[10px] text-sail-700">
                    {chat.messages.length} {t('sidebar.msgCount')}
                  </span>
                </div>
              </button>

              {chat.id !== editingId && (
                <div className="hidden group-hover:flex absolute bottom-1.5 right-2 items-center gap-0.5 bg-ocean-950/90 rounded-lg px-1 py-0.5 border border-ocean-800/30">
                  {confirmDelete === chat.id ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(chat.id)
                          setConfirmDelete(null)
                        }}
                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                        title={t('sidebar.confirmDelete')}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(null)
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title={t('sidebar.cancelDelete')}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExport(chat.id)
                        }}
                        className="p-1 text-sail-500 hover:text-cyan-400 transition-colors"
                        title={copiedId === chat.id ? t('sidebar.copied') : t('sidebar.export')}
                      >
                        {copiedId === chat.id ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onPin(chat.id)
                        }}
                        className={`p-1 transition-colors ${chat.pinned ? 'text-amber-400' : 'text-sail-500 hover:text-amber-400'}`}
                        title={chat.pinned ? t('sidebar.unpin') : t('sidebar.pin')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={chat.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRenameStart(chat.id, chat.title)
                        }}
                        className="p-1 text-sail-500 hover:text-sail-300 transition-colors"
                        title={t('sidebar.rename')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(chat.id)
                        }}
                        className="p-1 text-sail-500 hover:text-red-400 transition-colors"
                        title={t('sidebar.delete')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {!hasAnyChats && (
            <div className="flex flex-col items-center text-center gap-2 pt-8 px-4">
              <span className="text-3xl">⛵</span>
              <p className="text-sail-600 text-xs max-w-[200px]">
                {t('sidebar.emptyState')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
