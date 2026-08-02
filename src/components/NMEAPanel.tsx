import { useState, useEffect, useRef, useCallback } from 'react'
import { useNmeaConnection } from '../hooks/useNmeaConnection'
import { processFeedBuffer, generateFakeNmeaSentence, generateFakeSignalKDelta } from '../lib/nmea-parser'
import { BEAUFORT_SCALE, WIND_ANGLE_LABELS } from '../lib/constants'
import { useTrim } from '../context/TrimContext'
import type { ParsedWind, NmeaFeedLine } from '../types'

const SIM_INTERVAL_MS = 1500

function formatFeedLine(line: NmeaFeedLine): string {
  if (!line.parsed) return line.raw.length > 100 ? line.raw.slice(0, 100) + '...' : line.raw

  const p = line.parsed
  const beaufort = BEAUFORT_SCALE[p.force]
  const angleLabel = WIND_ANGLE_LABELS[p.windAngle]?.short ?? ''

  if (line.raw.startsWith('{')) {
    return `SigK →  ${p.direction}° ${angleLabel} · ${p.speedKnots.toFixed(1)} kn · F${p.force} ${beaufort.label}`
  }

  return `NMEA →  ${p.direction}° ${angleLabel} · ${p.speedKnots.toFixed(1)} kn · ${p.isTrue ? 'Real' : 'Aparente'} · F${p.force} ${beaufort.label}`
}

function NMEAPanel() {
  const { isConnected, isLoading, latestWind, feedLines, error, connect, disconnect } =
    useNmeaConnection()
  const { setLiveWind } = useTrim()
  const nmeaActiveRef = useRef(false)

  const [url, setUrl] = useState('ws://192.168.1.100:3000/signalk/v1/stream')
  const [isSimulating, setIsSimulating] = useState(false)
  const [simLatestWind, setSimLatestWind] = useState<ParsedWind | null>(null)
  const [simFeedLines, setSimFeedLines] = useState<NmeaFeedLine[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tickSimulation = useCallback(() => {
    const nmeaSentence = generateFakeNmeaSentence()
    const sigKDelta = generateFakeSignalKDelta()
    const combined = `${nmeaSentence}\n${sigKDelta}\n`

    setSimFeedLines((prev) => {
      const result = processFeedBuffer(combined, prev)
      if (result.latestWind) {
        setSimLatestWind(result.latestWind)
      }
      return result.lines
    })
  }, [])

  useEffect(() => {
    if (isSimulating && !isConnected) {
      tickSimulation()
      intervalRef.current = setInterval(tickSimulation, SIM_INTERVAL_MS)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isSimulating, isConnected, tickSimulation])

  useEffect(() => {
    if (isConnected) {
      setIsSimulating(false)
    }
  }, [isConnected])

  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false)
      setSimLatestWind(null)
      setSimFeedLines([])
    } else {
      setSimLatestWind(null)
      setSimFeedLines([])
      setIsSimulating(true)
    }
  }

  const displayWind = isConnected ? latestWind : isSimulating ? simLatestWind : null
  const displayFeed = isConnected ? feedLines : isSimulating ? simFeedLines : []
  const showInstruments = displayWind !== null
  const showFeed = displayFeed.length > 0

  useEffect(() => {
    if (displayWind) {
      nmeaActiveRef.current = true
      setLiveWind({
        direction: displayWind.direction,
        speedKnots: displayWind.speedKnots,
        force: displayWind.force,
      })
    } else if (nmeaActiveRef.current) {
      nmeaActiveRef.current = false
      setLiveWind(null)
    }
  }, [displayWind, setLiveWind])

  const beaufort = displayWind ? BEAUFORT_SCALE[displayWind.force] : null

  const handleConnect = () => {
    if (!url.trim()) return
    setIsSimulating(false)
    connect(url.trim())
  }

  return (
    <section id="nmea" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 ${
              isConnected
                ? 'bg-green-500/10 border border-green-500/20'
                : isSimulating
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-green-500/10 border border-green-500/20'
            }`}
          >
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected
                  ? 'bg-green-400 animate-pulse'
                  : isSimulating
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-sail-600'
              }`}
            />
            <span
              className={`text-xs font-semibold tracking-widest uppercase ${
                isConnected ? 'text-green-400' : isSimulating ? 'text-amber-400' : 'text-green-400'
              }`}
            >
              {isConnected ? 'Conectado' : isSimulating ? 'Simulando' : 'Datos reales'}
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            Conexión NMEA / SignalK
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            Conecta SailTrim al WiFi de tu barco para recibir datos de viento en tiempo real desde
            los instrumentos de a bordo. Compatible con SignalK y NMEA 0183 sobre WebSocket.
          </p>
        </div>

        <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ws://barco-ip:3000/signalk/v1/stream"
                aria-label="URL WebSocket del barco"
                disabled={isConnected || isSimulating}
                className="w-full bg-ocean-950/80 border border-ocean-800/50 rounded-xl px-4 py-3 font-mono text-sm text-sail-300 placeholder:text-sail-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2">
              {!isConnected ? (
                <>
                  <button
                    onClick={handleConnect}
                    disabled={isLoading || isSimulating}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 hover:shadow-green-500/40 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Conectando
                      </span>
                    ) : (
                      'Conectar'
                    )}
                  </button>
                  <button
                    onClick={toggleSimulation}
                    disabled={isLoading}
                    className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSimulating
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    {isSimulating ? 'Parar' : 'Simular'}
                  </button>
                </>
              ) : (
                <button
                  onClick={disconnect}
                  className="px-6 py-3 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all duration-300 active:scale-[0.98]"
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6 flex items-start gap-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {showInstruments && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <div className="relative aspect-square max-w-[220px] mx-auto">
                  <div
                    className={`absolute inset-0 rounded-full bg-ocean-900/80 border-2 transition-all duration-500 ${
                      isConnected
                        ? 'border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.08)]'
                        : 'border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.08)]'
                    }`}
                  >
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <defs>
                        <radialGradient id="nmeaBg" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgba(15,23,42,0.95)" />
                          <stop offset="100%" stopColor="rgba(2,8,23,0.95)" />
                        </radialGradient>
                      </defs>

                      <circle
                        cx="100"
                        cy="100"
                        r="95"
                        fill="url(#nmeaBg)"
                        stroke="rgba(100,116,139,0.2)"
                        strokeWidth="1"
                      />

                      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                        const rad = ((deg - 90) * Math.PI) / 180
                        const tick = deg % 90 === 0
                        const r1 = tick ? 82 : 86
                        const r2 = tick ? 68 : 76
                        return (
                          <g key={deg}>
                            <line
                              x1={100 + r1 * Math.cos(rad)}
                              y1={100 + r1 * Math.sin(rad)}
                              x2={100 + r2 * Math.cos(rad)}
                              y2={100 + r2 * Math.sin(rad)}
                              stroke={tick ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
                              strokeWidth={tick ? 1 : 0.5}
                            />
                          </g>
                        )
                      })}

                      <g
                        style={{
                          transform: `rotate(${displayWind!.direction}deg)`,
                          transformOrigin: '100px 100px',
                          transition: 'transform 0.3s ease-out',
                        }}
                      >
                        <polygon
                          points="100,12 96,34 100,30 104,34"
                          fill={isConnected ? 'rgba(34,197,94,0.9)' : 'rgba(245,158,11,0.9)'}
                          filter="url(#nmeaGlow)"
                        />
                        <polygon
                          points="100,188 96,166 100,170 104,166"
                          fill={isConnected ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="5"
                          fill={isConnected ? 'rgba(34,197,94,0.5)' : 'rgba(245,158,11,0.5)'}
                        />
                      </g>

                      <defs>
                        <filter id="nmeaGlow">
                          <feGaussianBlur stdDeviation="1.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col justify-center space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-ocean-950/60 rounded-2xl p-4 border border-ocean-800/20">
                    <span className="text-sail-600 text-xs uppercase tracking-wider font-medium mb-1 block">
                      Dirección viento
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-mono font-bold ${
                          isConnected ? 'text-green-300' : 'text-amber-300'
                        }`}
                      >
                        {displayWind!.direction}°
                      </span>
                    </div>
                    <span className="text-sail-500 text-xs">
                      {displayWind!.isTrue ? 'Real' : 'Aparente'}
                    </span>
                  </div>

                  <div className="bg-ocean-950/60 rounded-2xl p-4 border border-ocean-800/20">
                    <span className="text-sail-600 text-xs uppercase tracking-wider font-medium mb-1 block">
                      Velocidad
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-mono font-bold ${
                          isConnected ? 'text-green-300' : 'text-amber-300'
                        }`}
                      >
                        {displayWind!.speedKnots.toFixed(1)}
                      </span>
                      <span className="text-sail-600 text-sm">kn</span>
                    </div>
                  </div>
                </div>

                <div className="bg-ocean-950/60 rounded-2xl p-4 border border-ocean-800/20">
                  <span className="text-sail-600 text-xs uppercase tracking-wider font-medium mb-2 block">
                    Escala Beaufort
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-display font-bold text-white">
                      {displayWind!.force}
                    </span>
                    <div>
                      <p className="text-sail-300 font-semibold text-lg">{beaufort?.label}</p>
                      <p className="text-sail-600 text-sm">{beaufort?.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showInstruments && !error && (
            <div className="text-center py-16 text-sail-700">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 opacity-30"
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" />
              </svg>
              <p className="font-medium text-sm">
                Conéctate al WiFi del barco o pulsa <span className="text-amber-400">Simular</span> para ver datos de prueba
              </p>
              <p className="text-xs mt-1 text-sail-800">
                La simulación genera frases NMEA y SignalK realistas en tiempo real
              </p>
            </div>
          )}

          {showFeed && (
            <div className="mt-6 pt-6 border-t border-ocean-800/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sail-600 text-xs uppercase tracking-wider font-medium">
                  {isSimulating ? 'Feed simulado' : 'Feed en vivo'}
                </span>
                <span className="text-sail-700 text-xs font-mono">
                  {displayFeed.length} líneas
                </span>
              </div>
              <div className="bg-ocean-950/80 rounded-xl border border-ocean-800/30 p-4 h-48 overflow-y-auto font-mono text-xs">
                {displayFeed
                  .slice(-50)
                  .reverse()
                  .map((line, i) => {
                    const isNmea = line.raw.startsWith('$')
                    const isSigK = line.raw.startsWith('{')
                    return (
                      <div
                        key={i}
                        className={`py-1 leading-relaxed flex items-start gap-2 ${
                          line.parsed
                            ? isConnected
                              ? 'text-green-400/90'
                              : 'text-amber-400/90'
                            : line.error
                              ? 'text-red-400/60'
                              : 'text-sail-600'
                        }`}
                      >
                        <span className="text-sail-800 shrink-0 select-none w-[65px] text-right">
                          {new Date(line.timestamp).toLocaleTimeString()}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isNmea
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : isSigK
                                ? 'bg-violet-500/15 text-violet-400'
                                : 'bg-sail-700/20 text-sail-500'
                          }`}
                        >
                          {isNmea ? 'NMEA' : isSigK ? 'SigK' : 'RAW'}
                        </span>
                        <span className="break-all">{formatFeedLine(line)}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-ocean-800/20">
            <div className="flex items-center gap-3 text-sail-600 text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                SailTrim se conecta directamente al servidor SignalK de tu barco por WebSocket. La
                simulación genera frases <code className="text-sail-500 bg-ocean-950/60 px-1 rounded">$WIMWV</code> y
                deltas SignalK con datos aleatorios realistas y checksums válidos.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NMEAPanel
