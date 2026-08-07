import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTrim } from '../context/TrimContext'
import { getApiKey, getEffectiveConditions } from '../lib/gemini'
import { sendChatMessage, type ChatEntry, type ChatTone } from '../lib/chat'
import type { Conversation } from '../hooks/useChatHistory'
import { fileToDataUrl, getMaxImages, isImageFile, resizeDataUrl } from '../lib/image-utils'
import { GlossaryInlineMd } from './GlossaryInlineMd'

function mergeNumberedLines(lines: string[]): string[] {
  const merged: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const soloNum = line.match(/^(\d+)[.)]\s*$/)
    if (soloNum && i + 1 < lines.length && lines[i + 1].trim() && !/^\d+[.)]\s*$/.test(lines[i + 1])) {
      merged.push(`${soloNum[1]}. ${lines[i + 1]}`)
      i += 2
      continue
    }
    merged.push(line)
    i++
  }
  return merged
}

function ChatMarkdown({ text }: { text: string }) {
  const rawLines = text.split(/\r?\n/)
  const lines = mergeNumberedLines(rawLines)

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} />
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="text-sm font-semibold text-sail-300 pt-1">
              <GlossaryInlineMd text={line.slice(4)} />
            </h4>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-base font-bold text-cyan-300 pt-2 first:pt-0">
              <GlossaryInlineMd text={line.slice(3)} />
            </h3>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 text-sail-500 leading-relaxed">
              <span className="text-cyan-500/70 shrink-0 mt-0.5">▸</span>
              <span>
                <GlossaryInlineMd text={line.slice(2)} />
              </span>
            </div>
          )
        }
        const numbered = line.match(/^(\d+)[.)]\s+(.*)$/)
        if (numbered) {
          return (
            <div key={i} className="flex gap-2.5 text-sail-500 leading-relaxed">
              <span className="text-cyan-500/70 shrink-0 mt-0.5 font-mono text-xs w-5 text-right">
                {numbered[1]}.
              </span>
              <span>
                <GlossaryInlineMd text={numbered[2]} />
              </span>
            </div>
          )
        }
        return (
          <p key={i} className="text-sail-500 leading-relaxed">
            <GlossaryInlineMd text={line} />
          </p>
        )
      })}
    </div>
  )
}

const LOADING_DOTS = (
  <div className="flex items-center gap-1.5 py-1.5 px-2">
    <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:0ms]" />
    <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:150ms]" />
    <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:300ms]" />
  </div>
)

function MessageCopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    } catch {
      // clipboard not available
    }
  }, [text])

  return (
    <button
      onClick={copy}
      aria-label="Copiar mensaje"
      className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-2 right-2 p-1.5 rounded-lg bg-ocean-950/80 border border-ocean-700/40 hover:border-cyan-500/30 text-sail-600 hover:text-cyan-300 transition-all duration-200"
    >
      {done ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

function Lightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex)
  const { t } = useTranslation()

  const imgCount = images.length
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i > 0 ? i - 1 : imgCount - 1))
      if (e.key === 'ArrowRight') setIndex((i) => (i < imgCount - 1 ? i + 1 : 0))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [imgCount, onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        aria-label={t('chat.close')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i > 0 ? i - 1 : images.length - 1)) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            aria-label={t('chat.prevImage')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i < images.length - 1 ? i + 1 : 0)) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            aria-label={t('chat.nextImage')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
      <img
        src={images[index]}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

function ImageThumbnail({ src, onRemove, onClick }: { src: string; onRemove?: () => void; onClick?: () => void }) {
  return (
    <div className={`relative group shrink-0 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <img
        src={src}
        alt=""
        className="w-16 h-16 object-cover rounded-lg border border-ocean-700/40 hover:border-cyan-500/40 transition-all"
      />
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Eliminar imagen"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

const DIAGNOSTIC_COLORS = {
  tab: 'bg-amber-500/20 text-amber-300',
  bubble: 'bg-amber-500/5 border border-amber-500/20',
  accent: 'text-amber-300',
  dot: 'bg-amber-400',
  glow: 'shadow-amber-500/10',
}

const CONSULTAS_COLORS = {
  tab: 'bg-cyan-500/20 text-cyan-300',
  bubble: 'bg-ocean-950/70 border border-ocean-800/30',
  accent: 'text-cyan-300',
  dot: 'bg-cyan-400',
  glow: 'shadow-cyan-500/10',
}

interface ChatPanelProps {
  activeChat: Conversation | null
  activeId: string | null
  onCreateChat: (tone: ChatTone, diagnostic: boolean) => string
  onUpdateMessages: (id: string, messages: ChatEntry[]) => void
  onUpdateSettings: (id: string, settings: { tone?: ChatTone; diagnostic?: boolean }) => void
  onClearChat: () => void
  onToggleSidebar: () => void
}

function ChatPanel({ activeChat, activeId, onCreateChat, onUpdateMessages, onUpdateSettings, onClearChat, onToggleSidebar }: ChatPanelProps) {
  const { conditions, mode, liveWind } = useTrim()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [diagnostic, setDiagnostic] = useState(activeChat?.diagnostic ?? false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [tone, setTone] = useState<ChatTone>(activeChat?.tone ?? 'casual')
  const [fullscreen, setFullscreen] = useState(false)
  const [pendingImages, setPendingImages] = useState<string[]>([])
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const focusQueued = useRef(false)
  const wasFullscreen = useRef(false)
  const skipSave = useRef(false)
  const { t } = useTranslation()

  const messages = activeChat?.messages ?? []

  useEffect(() => {
    if (activeChat) {
      setDiagnostic(activeChat.diagnostic)
      setTone(activeChat.tone)
    }
    const draftKey = `sailtrim_draft_${activeChat?.id ?? 'new'}`
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw) as { input: string; images: string[] }
        if (draft.input) setInput(draft.input)
        if (draft.images?.length) setPendingImages(draft.images)
        skipSave.current = true
      } else {
        setInput('')
        setPendingImages([])
      }
    } catch {
      setPendingImages([])
    }
  }, [activeChat?.id])

  const prevSettingsRef = useRef({ tone, diagnostic })
  useEffect(() => {
    if (!activeId) return
    if (
      prevSettingsRef.current.tone !== tone ||
      prevSettingsRef.current.diagnostic !== diagnostic
    ) {
      onUpdateSettings(activeId, { tone, diagnostic })
      prevSettingsRef.current = { tone, diagnostic }
    }
  }, [tone, diagnostic, activeId, onUpdateSettings])

  const effective = getEffectiveConditions(conditions, mode, liveWind)

  const colors = diagnostic ? DIAGNOSTIC_COLORS : CONSULTAS_COLORS

  const scrollDown = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollDown()
  }, [messages, scrollDown])

  useEffect(() => {
    if (activeChat && activeChat.messages.length === 0) {
      setSuggestions([])
      setError('')
    }
  }, [activeChat?.id])

  const maxImages = getMaxImages()

  const handleAttach = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const remaining = maxImages - pendingImages.length
    if (remaining <= 0) return
    const fileArray = Array.from(files).slice(0, remaining)
    const validFiles = fileArray.filter(isImageFile)
    if (validFiles.length === 0) return
    const dataUrls = await Promise.all(validFiles.map(async (file) => {
      try {
        const dataUrl = await fileToDataUrl(file)
        return await resizeDataUrl(dataUrl)
      } catch {
        return ''
      }
    }))
    setPendingImages((prev) => [...prev, ...dataUrls.filter(Boolean)].slice(0, maxImages))
  }, [pendingImages.length, maxImages])

  const removePendingImage = useCallback((index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!inputRef.current || document.activeElement !== inputRef.current) return
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files)
        const imageFiles = files.filter(isImageFile)
        if (imageFiles.length > 0) {
          e.preventDefault()
          await handleFiles(imageFiles)
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handleFiles])

  const send = useCallback(async () => {
    const text = input.trim()
    if ((!text && pendingImages.length === 0) || loading) return

    const apiKey = getApiKey()
    if (!apiKey) {
      setError(t('chat.noKeyError'))
      return
    }

    setInput('')
    setError('')
    setSuggestions([])
    const imagesToSend = [...pendingImages]
    setPendingImages([])
    try {
      localStorage.removeItem(`sailtrim_draft_${activeId ?? 'new'}`)
    } catch {
      // ignore
    }

    let chatId = activeId
    if (!chatId) {
      chatId = onCreateChat(tone, diagnostic)
    }

    const currentMessages = activeChat?.messages ?? []
    const userMsg: ChatEntry = { role: 'user', content: text || ' ', images: imagesToSend.length > 0 ? imagesToSend : undefined }
    const updatedMessages = [...currentMessages, userMsg]
    onUpdateMessages(chatId, updatedMessages)
    setLoading(true)

    try {
      const { content, suggestions: sug } = await sendChatMessage(
        updatedMessages,
        effective,
        diagnostic,
        tone,
      )
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content }]
      onUpdateMessages(chatId, finalMessages)
      setSuggestions(sug)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('chat.apiError'))
    } finally {
      setLoading(false)
    }
  }, [input, pendingImages, loading, activeId, activeChat?.messages, effective, diagnostic, tone, onCreateChat, onUpdateMessages, t])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        send()
      }
    },
    [send],
  )

  useEffect(() => {
    if (focusQueued.current && inputRef.current) {
      inputRef.current.focus()
      focusQueued.current = false
    }
  }, [input])

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    const draftKey = `sailtrim_draft_${activeId ?? 'new'}`
    try {
      if (input.trim() || pendingImages.length > 0) {
        localStorage.setItem(draftKey, JSON.stringify({ input, images: pendingImages }))
      } else {
        localStorage.removeItem(draftKey)
      }
    } catch {
      // ignore
    }
  }, [input, pendingImages, activeId])

  const stripMarkdown = useCallback((text: string) => {
    return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
  }, [])

  const handleSuggestion = useCallback(
    (q: string) => {
      setInput(stripMarkdown(q))
      setSuggestions([])
      focusQueued.current = true
    },
    [stripMarkdown],
  )

  const clearChat = useCallback(() => {
    if (activeId) {
      onClearChat()
      setSuggestions([])
      setError('')
      setPendingImages([])
      try {
        localStorage.removeItem(`sailtrim_draft_${activeId}`)
      } catch {
        // ignore
      }
    }
  }, [activeId, onClearChat])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [fullscreen])

  useEffect(() => {
    if (wasFullscreen.current && !fullscreen) {
      const el = document.getElementById('chat')
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
    wasFullscreen.current = fullscreen
  }, [fullscreen])

  const hasMessages = messages.length > 0
  const placeholderKey = diagnostic ? 'chat.diagnosticPlaceholders' : 'chat.placeholders'
  const placeholders = useMemo(() => {
    const arr = t(placeholderKey, { returnObjects: true }) as string[]
    return Array.isArray(arr) ? arr : []
  }, [t, placeholderKey])
  const randomIdxRef = useRef(Math.floor(Math.random() * 6))
  const randomPlaceholder = useMemo(() => {
    const arr = placeholders
    return arr.length > 0 ? arr[randomIdxRef.current % arr.length] || arr[0] : ''
  }, [placeholders])
  const toneLabels = useMemo(() => {
    const labels = t('chat.tones', { returnObjects: true }) as Record<string, string>
    return labels || {}
  }, [t])

  const chatContent = (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-ocean-800/20 bg-ocean-950/40">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-ocean-950/70 p-0.5 gap-0.5">
            <button
              onClick={() => setDiagnostic(false)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !diagnostic ? colors.tab : 'text-sail-600 hover:text-sail-400'
              }`}
            >
              {t('chat.consultas')}
            </button>
            <button
              onClick={() => setDiagnostic(true)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                diagnostic ? DIAGNOSTIC_COLORS.tab : 'text-sail-600 hover:text-sail-400'
              }`}
            >
              {t('chat.diagnostic')}
            </button>
          </div>

          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ChatTone)}
            aria-label={t('chat.toneLabel')}
            className="bg-ocean-950/70 border border-ocean-700/40 rounded-xl px-2.5 py-1.5 text-xs text-sail-400 focus:outline-none focus:border-cyan-500/40 transition-all"
          >
            {Object.entries(toneLabels).map(([key, label]) => (
              <option key={key} value={key} className="bg-ocean-900">
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            aria-label={t('sidebar.toggle')}
            className="text-sail-600 hover:text-cyan-400 text-xs transition-colors"
            title={t('sidebar.toggle')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <button
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? t('chat.exitFullscreen') : t('chat.fullscreen')}
            className="text-sail-600 hover:text-sail-300 text-xs transition-colors"
            title={fullscreen ? t('chat.exitFullscreen') : t('chat.fullscreen')}
          >
            {fullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>

          {hasMessages && (
            <button
              onClick={clearChat}
              aria-label={t('chat.clearAria')}
              className="text-sail-600 hover:text-red-400 text-xs font-medium transition-colors"
            >
              {t('chat.clearChat')}
            </button>
          )}
        </div>
      </div>

      {diagnostic && (
        <div className="px-5 py-2.5 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2">
          <span className="text-amber-400 text-sm">🩺</span>
          <p className="text-amber-300/80 text-xs">
            {t('chat.diagnosticBanner')}
          </p>
        </div>
      )}

      <div
        ref={chatRef}
        className={`p-5 space-y-4 overflow-x-hidden ${
          fullscreen
            ? 'flex-1 overflow-y-auto'
            : hasMessages
              ? 'h-[420px] overflow-y-auto'
              : 'min-h-[420px] flex items-center justify-center'
        }`}
      >
        {!hasMessages && !loading && (
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-4xl">{diagnostic ? '🩺' : '⛵'}</span>
            <p className="text-sail-600 text-sm max-w-xs">
              {diagnostic
                ? t('chat.emptyDiagnostic')
                : t('chat.emptyConsultas')}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {placeholders.slice(0, 3).map((ph) => (
                <button
                  key={ph}
                  onClick={() => {
                    setInput(ph)
                    focusQueued.current = true
                  }}
                  className="px-3 py-1.5 bg-ocean-950/60 border border-ocean-800/30 hover:border-cyan-500/30 text-sail-500 hover:text-sail-300 text-xs rounded-xl transition-all"
                >
                  {ph}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={i}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`relative group max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-br from-cyan-500/20 to-wind-500/20 border border-cyan-500/30 text-sail-200'
                    : `${colors.bubble} text-sail-300`
                }`}
              >
                {isUser ? (
                  <div className="space-y-2">
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {msg.images.map((img, idx) => (
                          <ImageThumbnail
                            key={idx}
                            src={img}
                            onClick={() => setLightbox({ images: msg.images ?? [], index: idx })}
                          />
                        ))}
                      </div>
                    )}
                    {msg.content && msg.content !== ' ' && <p>{msg.content}</p>}
                  </div>
                ) : (
                  <>
                    <ChatMarkdown text={msg.content} />
                    <MessageCopyButton text={msg.content} />
                  </>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex justify-start animate-slide-up">
            <div className={`rounded-2xl px-4 py-3 ${colors.bubble}`}>
              {LOADING_DOTS}
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm text-red-400 max-w-sm text-center">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-3 text-red-300 hover:text-red-200 font-medium underline underline-offset-2"
              >
                {t('chat.ok')}
              </button>
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className={`px-5 py-3 border-t ${diagnostic ? 'border-amber-500/10 bg-amber-500/5' : 'border-ocean-800/20 bg-ocean-950/30'} flex flex-wrap items-center gap-2`}>
          <span className="text-sail-700 text-xs shrink-0 mr-1">{t('chat.suggestions')}</span>
          {suggestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(q)}
              className={`px-3 py-1.5 border text-xs rounded-xl transition-all active:scale-[0.97] ${
                diagnostic
                  ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-300'
                  : 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-300'
              }`}
            >
              <GlossaryInlineMd text={q} />
            </button>
          ))}
        </div>
      )}

      <div className={`space-y-2 p-4 border-t ${diagnostic ? 'border-amber-500/10' : 'border-ocean-800/20'} bg-ocean-950/40`}>
        {pendingImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pendingImages.map((img, idx) => (
              <ImageThumbnail
                key={idx}
                src={img}
                onRemove={() => removePendingImage(idx)}
                onClick={() => setLightbox({ images: pendingImages, index: idx })}
              />
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingImages.length > 0 ? t('chat.imagePlaceholder') : randomPlaceholder}
            rows={2}
            disabled={loading}
            className="flex-1 resize-none bg-ocean-950/60 border border-ocean-800/30 focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-sail-200 placeholder-sail-700 disabled:opacity-50 transition-all"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            onClick={handleAttach}
            disabled={loading || pendingImages.length >= maxImages}
            aria-label={t('chat.attachImage')}
            className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
              pendingImages.length >= maxImages
                ? 'bg-ocean-950/60 text-sail-700 cursor-not-allowed'
                : 'bg-ocean-900/60 border border-ocean-700/40 hover:border-cyan-500/40 text-sail-400 hover:text-cyan-300 hover:bg-ocean-800/60'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <button
            onClick={send}
            aria-label={t('chat.sendAria')}
            disabled={(!input.trim() && pendingImages.length === 0) || loading}
            className={`shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-br ${
              diagnostic
                ? 'from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20'
                : 'from-cyan-500 to-wind-500 hover:from-cyan-400 hover:to-wind-400 shadow-cyan-500/20'
            } disabled:from-ocean-800 disabled:to-ocean-800 disabled:text-sail-700 text-white rounded-xl transition-all duration-300 active:scale-[0.95] disabled:cursor-not-allowed shadow-lg`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )

  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col bg-ocean-950'
    : 'bg-ocean-900/30 border border-ocean-800/30 rounded-3xl overflow-hidden'

  return (
    <section id="chat" className={`relative ${fullscreen ? '' : 'py-24 px-4'}`}>
      {!fullscreen && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-wind-400 text-sm font-semibold tracking-widest uppercase">
              {t('chat.step')}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
              {t('chat.title')}
            </h2>
            <p className="text-sail-600 text-lg max-w-lg mx-auto">
              {t('chat.subtitle')}
            </p>
          </div>
        </div>
      )}

      <div className={fullscreen ? 'flex-1 flex flex-col h-full' : 'max-w-3xl mx-auto'}>
        <div className={containerClasses}>
          {chatContent}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  )
}

export default ChatPanel
