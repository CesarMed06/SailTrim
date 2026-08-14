import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTrim } from '../context/TrimContext'
import { getApiKey, getEffectiveConditions } from '../lib/gemini'
import { sendChatMessage, type ChatEntry, type ChatTone } from '../lib/chat'
import type { Conversation } from '../hooks/useChatHistory'
import { fileToDataUrl, getMaxImages, isImageFile, resizeDataUrl } from '../lib/image-utils'
import { ChatInput } from './ChatInput'
import { Lightbox } from './Lightbox'
import { LoadingDots } from './LoadingDots'
import { MessageBubble } from './MessageBubble'
import { SuggestedQuestions } from './SuggestedQuestions'

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

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            bubbleClass={colors.bubble}
            onImageClick={(images, idx) => setLightbox({ images, index: idx })}
          />
        ))}

        {loading && (
          <div className="flex justify-start animate-slide-up">
            <div className={`rounded-2xl px-4 py-3 ${colors.bubble}`}>
              <LoadingDots />
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
        <SuggestedQuestions
          suggestions={suggestions}
          diagnostic={diagnostic}
          onSelect={handleSuggestion}
        />
      )}

      <ChatInput
        input={input}
        onInputChange={setInput}
        pendingImages={pendingImages}
        onRemoveImage={removePendingImage}
        onPreviewImage={(images, idx) => setLightbox({ images, index: idx })}
        loading={loading}
        maxImages={maxImages}
        diagnostic={diagnostic}
        placeholder={randomPlaceholder}
        inputRef={inputRef}
        fileInputRef={fileInputRef}
        onKeyDown={handleKeyDown}
        onSend={send}
        onAttach={handleAttach}
        onFiles={handleFiles}
      />
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
