import { useCallback, useEffect, useRef, useState } from 'react'
import { useTrim } from '../context/TrimContext'
import { getApiKey, getEffectiveConditions } from '../lib/gemini'
import { sendChatMessage, TONE_LABELS, type ChatEntry, type ChatTone } from '../lib/chat'
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

const PLACEHOLDERS = [
  '¿Cómo afecta el estado del mar al trimado?',
  '¿Cuándo debo tomar un rizo?',
  '¿Qué hago si el barco escora demasiado?',
  '¿Cómo ajusto el traveller en ceñida?',
  'Explica qué es el cunningham',
  'Diferencia entre foque y genoa',
]

const DIAGNOSTIC_PLACEHOLDERS = [
  'El barco escora mucho y no puedo ceñir',
  'La vela mayor flamea en la baluma',
  'Pierdo velocidad en las viradas',
  'El timón está muy duro',
  'Noto mucho derrape a través',
]

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

function ChatPanel() {
  const { conditions, mode, liveWind } = useTrim()
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [diagnostic, setDiagnostic] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [tone, setTone] = useState<ChatTone>('casual')
  const [fullscreen, setFullscreen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const focusQueued = useRef(false)
  const wasFullscreen = useRef(false)

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

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const apiKey = getApiKey()
    if (!apiKey) {
      setError('Configura tu clave de Gemini en el panel de arriba para usar el chat.')
      return
    }

    setInput('')
    setError('')
    setSuggestions([])

    const userMsg: ChatEntry = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const { content, suggestions: sug } = await sendChatMessage(
        [...messages, userMsg],
        effective,
        diagnostic,
        tone,
      )
      setMessages((prev) => [...prev, { role: 'assistant', content }])
      setSuggestions(sug)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al contactar con el patrón IA')
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, effective, diagnostic, tone])

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
    setMessages([])
    setSuggestions([])
    setError('')
  }, [])

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
  const placeholders = diagnostic ? DIAGNOSTIC_PLACEHOLDERS : PLACEHOLDERS
  const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)]

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
              💬 Consultas
            </button>
            <button
              onClick={() => setDiagnostic(true)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                diagnostic ? DIAGNOSTIC_COLORS.tab : 'text-sail-600 hover:text-sail-400'
              }`}
            >
              🩺 ¿Qué está pasando?
            </button>
          </div>

          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ChatTone)}
            aria-label="Tono del patrón"
            className="bg-ocean-950/70 border border-ocean-700/40 rounded-xl px-2.5 py-1.5 text-xs text-sail-400 focus:outline-none focus:border-cyan-500/40 transition-all"
          >
            {Object.entries(TONE_LABELS).map(([key, label]) => (
              <option key={key} value={key} className="bg-ocean-900">
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="text-sail-600 hover:text-sail-300 text-xs transition-colors"
            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
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
              aria-label="Limpiar conversación"
              className="text-sail-600 hover:text-red-400 text-xs font-medium transition-colors"
            >
              🗑️ Limpiar
            </button>
          )}
        </div>
      </div>

      {diagnostic && (
        <div className="px-5 py-2.5 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2">
          <span className="text-amber-400 text-sm">🩺</span>
          <p className="text-amber-300/80 text-xs">
            Modo diagnóstico activo — describe un síntoma y el patrón te dirá qué falla y cómo arreglarlo.
          </p>
        </div>
      )}

      <div
        ref={chatRef}
        className={`p-5 space-y-4 overflow-x-hidden ${fullscreen ? 'flex-1 overflow-y-auto' : hasMessages ? 'h-[420px] overflow-y-auto' : 'min-h-[420px] flex items-center justify-center'}`}
      >
        {!hasMessages && !loading && (
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-4xl">{diagnostic ? '🩺' : '⛵'}</span>
            <p className="text-sail-600 text-sm max-w-xs">
              {diagnostic
                ? 'Describe un síntoma y el patrón diagnosticará qué falla en el trimado.'
                : 'Pregunta cualquier cosa sobre trimado, maniobras o tu barco. El patrón IA conoce tus condiciones actuales.'}
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
                  <p>{msg.content}</p>
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
                Ok
              </button>
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className={`px-5 py-3 border-t ${diagnostic ? 'border-amber-500/10 bg-amber-500/5' : 'border-ocean-800/20 bg-ocean-950/30'} flex flex-wrap items-center gap-2`}>
          <span className="text-sail-700 text-xs shrink-0 mr-1">Sugerencias:</span>
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

      <div className={`flex items-end gap-2 p-4 border-t ${diagnostic ? 'border-amber-500/10' : 'border-ocean-800/20'} bg-ocean-950/40`}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={randomPlaceholder}
          rows={2}
          disabled={loading}
          className="flex-1 resize-none bg-ocean-950/60 border border-ocean-800/30 focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-sail-200 placeholder-sail-700 disabled:opacity-50 transition-all"
        />
        <button
          onClick={send}
          aria-label="Enviar mensaje"
          disabled={!input.trim() || loading}
          className={`shrink-0 p-3 bg-gradient-to-br ${
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
              Paso 4
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
              Chat con el patrón
            </h2>
            <p className="text-sail-600 text-lg max-w-lg mx-auto">
              Pregunta lo que quieras sobre trimado, maniobras o tu barco. El patrón IA responde
              como si estuvieras a bordo.
            </p>
          </div>
        </div>
      )}

      <div className={fullscreen ? 'flex-1 flex flex-col h-full' : 'max-w-3xl mx-auto'}>
        <div className={containerClasses}>
          {chatContent}
        </div>
      </div>
    </section>
  )
}

export default ChatPanel
