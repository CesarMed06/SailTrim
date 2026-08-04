import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTrim } from '../context/TrimContext'
import { analyzeTrim, getApiKey, getEffectiveConditions } from '../lib/gemini'
import { GlossaryInlineMd } from './GlossaryInlineMd'

type Status = 'idle' | 'loading' | 'success' | 'error'

const INTERVAL_OPTIONS = [30, 60, 120, 300]

function formatInterval(sec: number): string {
  if (sec < 60) return `${sec} s`
  if (sec === 60) return '1 min'
  return `${sec / 60} min`
}

function MarkdownText({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split(/\r?\n/).map((line, i) => {
        if (!line.trim()) return <div key={i} />
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="text-base font-display font-semibold text-sail-300 pt-2">
              <GlossaryInlineMd text={line.slice(4)} />
            </h4>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-lg font-display font-bold text-cyan-300 pt-3 first:pt-0">
              <GlossaryInlineMd text={line.slice(3)} />
            </h3>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2.5 text-sail-500 leading-relaxed">
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

interface TrimAnalyzerProps {
  onOpenApiKey: () => void
}

function TrimAnalyzer({ onOpenApiKey }: TrimAnalyzerProps) {
  const { conditions, mode, liveWind } = useTrim()
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [auto, setAuto] = useState(false)
  const [intervalSec, setIntervalSec] = useState(60)
  const [copied, setCopied] = useState(false)
  const [resultKey, setResultKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const loadingRef = useRef(false)
  const autoRef = useRef(auto)
  const statusRef = useRef(status)

  useEffect(() => {
    autoRef.current = auto
  }, [auto])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const effective = useMemo(
    () => getEffectiveConditions(conditions, mode, liveWind),
    [conditions, mode, liveWind],
  )

  const effectiveRef = useRef(effective)
  useEffect(() => {
    effectiveRef.current = effective
  }, [effective])

  const liveWindRef = useRef(liveWind)
  useEffect(() => {
    liveWindRef.current = liveWind
  }, [liveWind])

  const hasData = mode === 'manual' || liveWind !== null

  const runAnalysis = useCallback(async () => {
    if (loadingRef.current) return
    const apiKey = getApiKey()
    if (!apiKey) {
      onOpenApiKey()
      return
    }
    const current = effectiveRef.current
    if (current.mode !== 'manual' && !liveWindRef.current) return

    loadingRef.current = true
    const keepResult = statusRef.current === 'success'
    const background = autoRef.current && keepResult
    if (keepResult) {
      setRefreshing(true)
    } else {
      setStatus('loading')
    }
    setError('')
    try {
      const text = await analyzeTrim(current, apiKey)
      setResult(text)
      setResultKey((k) => k + 1)
      setStatus('success')
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : 'Error inesperado al analizar')
        setResult('')
        setStatus('error')
      }
    } finally {
      loadingRef.current = false
      setRefreshing(false)
    }
  }, [onOpenApiKey])

  useEffect(() => {
    if (!auto || mode === 'manual') return
    runAnalysis()
    const id = setInterval(runAnalysis, intervalSec * 1000)
    return () => clearInterval(id)
  }, [auto, mode, runAnalysis, intervalSec])

  const copyResult = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // portapapeles no disponible
    }
  }, [result])

  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <button
          onClick={runAnalysis}
          disabled={!hasData || status === 'loading'}
          className="flex-1 relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-wind-500 hover:from-cyan-400 hover:to-wind-400 text-white font-bold text-lg rounded-2xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98] overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Analizar trimado
          </span>
        </button>

        {mode !== 'manual' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuto((prev) => !prev)}
              className={`flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
                auto
                  ? 'bg-green-500/15 border-green-500/40 text-green-300 shadow-lg shadow-green-500/10'
                  : 'border-ocean-700/40 text-sail-500 hover:text-sail-300 hover:border-ocean-600/50'
              }`}
              aria-pressed={auto}
            >
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  auto ? 'bg-green-400 animate-pulse' : 'bg-sail-600'
                }`}
              />
              {auto ? 'Análisis continuo activo' : 'Análisis continuo'}
            </button>
            {auto && (
              <select
                value={intervalSec}
                onChange={(e) => setIntervalSec(Number(e.target.value))}
                aria-label="Intervalo de análisis continuo"
                className="bg-ocean-950/70 border border-ocean-700/40 rounded-xl px-3 py-3.5 text-sm text-sail-300 focus:outline-none focus:border-green-500/40 transition-all"
              >
                {INTERVAL_OPTIONS.map((sec) => (
                  <option key={sec} value={sec} className="bg-ocean-900">
                    cada {formatInterval(sec)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {!hasData && (
        <p className="text-center text-amber-400/90 text-sm mt-4">
          {mode === 'demo'
            ? 'Activa la simulación de viento para alimentar el modo Demo.'
            : 'Conecta el barco en la sección NMEA / SignalK para recibir datos en vivo.'}
        </p>
      )}

      {status === 'loading' && !result && (
        <div className="mt-6 bg-ocean-950/60 border border-ocean-800/30 rounded-2xl py-14 flex flex-col items-center justify-center animate-fade-in">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-ocean-800 border-t-cyan-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">⛵</div>
          </div>
          <p className="mt-5 text-cyan-300 font-semibold animate-pulse">Consultando al patrón…</p>
          <p className="text-sail-600 text-sm mt-1">Analizando condiciones y ajustes de trimado</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-3 animate-fade-in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="text-red-400 font-medium text-sm">{error}</p>
            <p className="text-sail-600 text-xs mt-1">
              Comprueba tu API key o tu conexión a internet e inténtalo de nuevo.
            </p>
          </div>
          <button
            onClick={runAnalysis}
            className="shrink-0 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-semibold rounded-xl transition-all"
          >
            Reintentar
          </button>
        </div>
      )}

      {result && (status === 'success' || status === 'loading') && (
        <div className="mt-6 bg-ocean-950/60 border border-cyan-500/20 rounded-2xl p-6 md:p-8 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-widest uppercase">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Plan de trimado
              </span>
              {(auto || refreshing) && (
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-sail-600">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      refreshing ? 'bg-amber-400 animate-ping' : 'bg-green-400 animate-pulse'
                    }`}
                  />
                  {refreshing ? 'actualizando…' : `se actualiza cada ${formatInterval(intervalSec)}`}
                </span>
              )}
            </div>
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 text-sail-600 hover:text-sail-300 text-xs font-medium transition-colors"
            >
              {copied ? (
                <span className="text-green-400">✓ Copiado</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>

          <div key={resultKey} className="animate-fade-in">
            <MarkdownText text={result} />
          </div>

          <div className="mt-7 pt-4 border-t border-ocean-800/20 flex items-center justify-between text-xs">
            <span className="text-sail-700">
              Basado en las condiciones actuales ·{' '}
              {mode === 'manual' ? 'modo manual' : mode === 'demo' ? 'simulación en vivo' : 'datos del barco'}
            </span>
            <button
              onClick={runAnalysis}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              ↻ Re-analizar
            </button>
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div className="mt-6 text-center py-8 text-sail-700 text-sm">
          <span className="inline-flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Pulsa «Analizar trimado» para recibir el plan completo de tu patrón IA.
          </span>
        </div>
      )}
    </div>
  )
}

export default TrimAnalyzer
