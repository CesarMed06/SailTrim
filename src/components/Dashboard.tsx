import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTrim, type TrimMode } from '../context/TrimContext'
import { getApiKey, getEffectiveConditions } from '../lib/gemini'
import { BEAUFORT_SCALE, BOAT_TYPES, EXPERIENCE_LEVELS, WIND_ANGLE_LABELS } from '../lib/constants'
import ApiKeyModal from './ApiKeyModal'
import ApiKeyGuide from './ApiKeyGuide'
import TrimAnalyzer from './TrimAnalyzer'

const MODES: { value: TrimMode; label: string; icon: string; desc: string }[] = [
  { value: 'manual', label: 'Manual', icon: '🎛️', desc: 'Tú defines viento y rumbo' },
  { value: 'demo', label: 'Demo', icon: '🌀', desc: 'Viento simulado en vivo' },
  { value: 'live', label: 'En vivo', icon: '📡', desc: 'Datos reales del barco' },
]

const MODE_ACCENT: Record<TrimMode, string> = {
  manual: 'from-wind-500 to-cyan-500',
  demo: 'from-cyan-500 to-teal-500',
  live: 'from-green-500 to-emerald-500',
}

const MODE_DOT: Record<TrimMode, string> = {
  manual: 'bg-wind-400',
  demo: 'bg-cyan-400',
  live: 'bg-green-400',
}

interface DashboardProps {
  simulationRunning: boolean
  onToggleSimulation: () => void
}

function Dashboard({ simulationRunning, onToggleSimulation }: DashboardProps) {
  const { conditions, mode, setMode, liveWind } = useTrim()
  const [apiModalOpen, setApiModalOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [keyConfigured, setKeyConfigured] = useState(() => !!getApiKey())
  const prevMode = useRef(mode)

  const effective = useMemo(
    () => getEffectiveConditions(conditions, mode, liveWind),
    [conditions, mode, liveWind],
  )

  useEffect(() => {
    if (mode === 'demo' && prevMode.current !== 'demo' && !simulationRunning) {
      onToggleSimulation()
    }
    prevMode.current = mode
  }, [mode, simulationRunning, onToggleSimulation])

  useEffect(() => {
    setKeyConfigured(!!getApiKey())
  }, [apiModalOpen])

  const openApiKey = useCallback(() => setApiModalOpen(true), [])
  const closeApiKey = useCallback(() => setApiModalOpen(false), [])
  const openGuide = useCallback(() => setGuideOpen(true), [])
  const closeGuide = useCallback(() => setGuideOpen(false), [])

  const boat = BOAT_TYPES.find((b) => b.value === effective.boatType)?.label ?? effective.boatType
  const exp = EXPERIENCE_LEVELS.find((e) => e.value === effective.experience)?.label ?? effective.experience
  const beaufort = BEAUFORT_SCALE[effective.force]
  const angleLabel = WIND_ANGLE_LABELS[effective.angle]?.short ?? `${effective.angle}°`
  const windText =
    effective.speedKnots !== null
      ? `${effective.speedKnots.toFixed(1)} kn · F${effective.force}`
      : `${beaufort.windSpeed} · F${effective.force}`
  const seaText =
    effective.seaState === 'calm'
      ? 'Calma'
      : effective.seaState === 'moderate'
        ? 'Moderada'
        : effective.seaState === 'rough'
          ? 'Gruesa'
          : '—'

  const chips = [
    { icon: '🚢', label: 'Barco', value: boat },
    { icon: '🧭', label: 'Ángulo', value: `${effective.angle}° ${angleLabel}` },
    { icon: '💨', label: 'Viento', value: windText },
    { icon: '🌊', label: 'Mar', value: seaText },
    { icon: '🎓', label: 'Nivel', value: exp },
  ]

  return (
    <section id="assistant" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-wind-400 text-sm font-semibold tracking-widest uppercase">
            Paso 3
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            Asistente de trimado
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            Elige cómo obtener los datos, revisa las condiciones actuales y deja que el patrón IA
            te diga exactamente cómo trimar.
          </p>
        </div>

        <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {MODES.map((m) => {
              const selected = mode === m.value
              return (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    selected
                      ? `bg-gradient-to-br ${MODE_ACCENT[m.value]} border-transparent shadow-lg shadow-cyan-500/10 scale-[1.02]`
                      : 'bg-ocean-950/50 border-ocean-800/30 hover:border-ocean-700/50 hover:bg-ocean-900/50'
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-300 ${selected ? '' : 'group-hover:scale-110'}`}>
                    {m.icon}
                  </span>
                  <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-sail-300'}`}>
                    {m.label}
                  </span>
                  <span className={`text-[11px] ${selected ? 'text-white/80' : 'text-sail-600'}`}>
                    {m.desc}
                  </span>
                  {selected && (
                    <span
                      className={`absolute top-2 right-2 w-2 h-2 rounded-full ${MODE_DOT[m.value]} shadow-md`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="bg-ocean-950/60 rounded-2xl border border-ocean-800/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sail-600 text-xs uppercase tracking-wider font-medium flex items-center gap-2">
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    mode === 'manual' ? 'bg-sail-500' : `${MODE_DOT[mode]} animate-pulse`
                  }`}
                />
                Condiciones actuales
                {mode !== 'manual' && (
                  <span className="text-[10px] normal-case font-normal text-sail-700">
                    · datos en tiempo real
                  </span>
                )}
              </span>
              <span className="text-sail-700 text-xs">
                {mode === 'manual'
                  ? 'configuración manual'
                  : mode === 'demo'
                    ? 'simulador'
                    : 'instrumentos del barco'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {chips.map((chip) => (
                <div
                  key={chip.label}
                  className="bg-ocean-900/60 rounded-xl p-3 border border-ocean-800/20 text-center"
                >
                  <span className="text-lg block mb-1">{chip.icon}</span>
                  <span className="text-[10px] text-sail-700 uppercase tracking-wider block">
                    {chip.label}
                  </span>
                  <span className="text-xs font-semibold text-sail-200 block mt-0.5 leading-snug">
                    {chip.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-ocean-950/40 rounded-2xl border border-ocean-800/20 px-5 py-4">
            <div className="flex items-center gap-3">
              <span
                className={`relative inline-flex h-2.5 w-2.5 ${
                  keyConfigured ? 'bg-green-400' : 'bg-amber-400'
                } rounded-full ${
                  keyConfigured ? '' : 'animate-pulse'
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-sail-200">
                  {keyConfigured ? 'Clave de Gemini configurada' : 'Falta tu clave de Gemini'}
                </p>
                <p className="text-xs text-sail-600">
                  Gratis e ilimitado: cada navegante usa su propia clave (1.500 consultas/día)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                onClick={openApiKey}
                className="px-5 py-2.5 bg-wind-500/15 border border-wind-500/30 hover:bg-wind-500/25 text-wind-300 font-semibold text-sm rounded-xl transition-all duration-300 active:scale-[0.98]"
              >
                {keyConfigured ? 'Cambiar clave' : 'Configurar clave'}
              </button>
              <button
                onClick={openGuide}
                className="px-5 py-2.5 text-sail-500 hover:text-sail-300 border border-ocean-700/40 hover:border-ocean-600/60 text-sm font-medium rounded-xl transition-all duration-300 active:scale-[0.98]"
              >
                ¿Cómo la consigo?
              </button>
            </div>
          </div>

          <TrimAnalyzer onOpenApiKey={openApiKey} />
        </div>
      </div>

      <ApiKeyModal open={apiModalOpen} onClose={closeApiKey} onOpenGuide={openGuide} />
      <ApiKeyGuide open={guideOpen} onClose={closeGuide} />
    </section>
  )
}

export default Dashboard
