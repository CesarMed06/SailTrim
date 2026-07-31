import type { SimulatedWind } from '../hooks/useWindSimulation'
import { BEAUFORT_SCALE } from '../lib/constants'

interface SimulationPanelProps {
  isRunning: boolean
  wind: SimulatedWind
  onToggle: () => void
}

function SimulationPanel({ isRunning, wind, onToggle }: SimulationPanelProps) {
  const beaufort = BEAUFORT_SCALE[wind.force]
  const needleRotation = wind.direction
  const trendIcons: Record<SimulatedWind['trend'], string> = {
    steady: '→',
    increasing: '↗',
    decreasing: '↘',
    backing: '↺',
    veering: '↻',
  }

  const trendColors: Record<SimulatedWind['trend'], string> = {
    steady: 'text-sail-400',
    increasing: 'text-amber-400',
    decreasing: 'text-sky-400',
    backing: 'text-violet-400',
    veering: 'text-emerald-400',
  }

  const trendLabels: Record<SimulatedWind['trend'], string> = {
    steady: 'Estable',
    increasing: 'Subiendo',
    decreasing: 'Bajando',
    backing: 'Rolando atrás',
    veering: 'Rolando derecha',
  }

  return (
    <section id="demo" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRunning ? 'bg-cyan-400' : 'bg-sail-700'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-cyan-400' : 'bg-sail-600'}`} />
            </span>
            <span className="text-cyan-400 text-xs font-semibold tracking-widest uppercase">
              {isRunning ? 'Demo en vivo' : 'Modo demo'}
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            Simulación de viento
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            Datos de viento simulados en tiempo real. Actívalo para ver cómo se comportaría el sistema con instrumentos reales del barco.
          </p>
        </div>

        <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <span className="text-sail-500 text-sm font-medium uppercase tracking-wider">
              Panel de instrumentos
            </span>

            <button
              onClick={onToggle}
              className={`relative inline-flex items-center h-8 w-16 rounded-full transition-all duration-500 ${
                isRunning
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25'
                  : 'bg-ocean-800/70'
              }`}
              aria-label={isRunning ? 'Detener simulación' : 'Iniciar simulación'}
            >
              <span
                className={`inline-block w-6 h-6 rounded-full bg-white shadow-md transform transition-all duration-500 ease-out ${
                  isRunning ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="relative aspect-square max-w-[220px] mx-auto">
                <div className={`absolute inset-0 rounded-full bg-ocean-900/80 border-2 border-ocean-700/30 transition-all duration-1000 ${isRunning ? 'shadow-[0_0_40px_rgba(34,211,238,0.08)]' : ''}`}>
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <radialGradient id="instBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(15,23,42,0.95)" />
                        <stop offset="100%" stopColor="rgba(2,8,23,0.95)" />
                      </radialGradient>
                    </defs>

                    <circle cx="100" cy="100" r="95" fill="url(#instBg)" stroke="rgba(100,116,139,0.2)" strokeWidth="1" />

                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                      const rad = ((deg - 90) * Math.PI) / 180
                      const tick = deg % 90 === 0
                      const r1 = tick ? 82 : 86
                      const r2 = tick ? 68 : 76
                      const innerTick = deg % 30 === 0
                      const ir1 = tick ? 28 : innerTick ? 34 : 0
                      const ir2 = tick ? 18 : innerTick ? 26 : 0
                      return (
                        <g key={deg}>
                          {ir1 > 0 && (
                            <line
                              x1={100 + ir1 * Math.cos(rad)}
                              y1={100 + ir1 * Math.sin(rad)}
                              x2={100 + ir2 * Math.cos(rad)}
                              y2={100 + ir2 * Math.sin(rad)}
                              stroke="rgba(255,255,255,0.15)"
                              strokeWidth={tick ? 1 : 0.5}
                            />
                          )}
                          <line
                            x1={100 + r1 * Math.cos(rad)}
                            y1={100 + r1 * Math.sin(rad)}
                            x2={100 + r2 * Math.cos(rad)}
                            y2={100 + r2 * Math.sin(rad)}
                            stroke={tick ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}
                            strokeWidth={tick ? 1.2 : 0.5}
                          />
                          {tick && (
                            <text
                              x={100 + 58 * Math.cos(rad)}
                              y={100 + 58 * Math.sin(rad) + 4}
                              textAnchor="middle"
                              fill="rgba(255,255,255,0.45)"
                              fontSize="10"
                              fontFamily="JetBrains Mono, monospace"
                            >
                              {deg}°
                            </text>
                          )}
                        </g>
                      )
                    })}

                    <g
                      style={{
                        transform: `rotate(${needleRotation}deg)`,
                        transformOrigin: '100px 100px',
                        transition: isRunning ? 'transform 0.2s ease-out' : 'transform 0.8s ease-out',
                      }}
                    >
                      <polygon
                        points="100,12 96,34 100,30 104,34"
                        fill="rgba(34,211,238,0.9)"
                        filter="url(#needleGlow)"
                      />
                      <polygon
                        points="100,188 96,166 100,170 104,166"
                        fill="rgba(34,211,238,0.35)"
                      />
                      <circle cx="100" cy="100" r="5" fill="rgba(34,211,238,0.6)" />
                    </g>

                    <defs>
                      <filter id="needleGlow">
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

            <div className="md:col-span-2 flex flex-col justify-center space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-ocean-950/60 rounded-2xl p-4 border border-ocean-800/20">
                  <span className="text-sail-600 text-xs uppercase tracking-wider font-medium mb-1 block">
                    Dirección
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-mono font-bold transition-all duration-300 ${isRunning ? 'text-cyan-300' : 'text-sail-500'}`}>
                      {wind.direction}
                    </span>
                    <span className="text-sail-600 text-sm">°</span>
                  </div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${trendColors[wind.trend]}`}>
                    {trendIcons[wind.trend]} {trendLabels[wind.trend]}
                  </span>
                </div>

                <div className="bg-ocean-950/60 rounded-2xl p-4 border border-ocean-800/20">
                  <span className="text-sail-600 text-xs uppercase tracking-wider font-medium mb-1 block">
                    Velocidad
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-mono font-bold transition-all duration-300 ${isRunning ? 'text-cyan-300' : 'text-sail-500'}`}>
                      {wind.speedKnots.toFixed(1)}
                    </span>
                    <span className="text-sail-600 text-sm">kn</span>
                  </div>
                  {wind.gustKnots && (
                    <span className="text-amber-400 text-xs font-medium">
                      ↗ Ráfaga +{wind.gustKnots.toFixed(1)} kn
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-ocean-950/60 rounded-2xl p-4 border border-ocean-800/20">
                <span className="text-sail-600 text-xs uppercase tracking-wider font-medium mb-2 block">
                  Escala Beaufort
                </span>
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-display font-bold transition-all duration-300 ${isRunning ? 'text-white' : 'text-sail-500'}`}>
                    {wind.force}
                  </span>
                  <div>
                    <p className="text-sail-300 font-semibold text-lg">{beaufort.label}</p>
                    <p className="text-sail-600 text-sm">{beaufort.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-ocean-950/60 rounded-2xl p-4 border border-ocean-800/20">
                <div className="flex justify-between items-center">
                  <span className="text-sail-600 text-xs uppercase tracking-wider font-medium">
                    Velocidad del viento
                  </span>
                  <span className={`text-sm font-mono transition-colors duration-300 ${isRunning ? 'text-sail-300' : 'text-sail-600'}`}>
                    {beaufort.windSpeed}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-ocean-800/20">
            <div className="flex items-center gap-3 text-sail-600 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                {isRunning
                  ? 'Simulando datos de viento en tiempo real. Las variaciones imitan el comportamiento natural del viento en el mar.'
                  : 'Activa la simulación para ver cómo funcionaría SailTrim con instrumentos reales del barco.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SimulationPanel
