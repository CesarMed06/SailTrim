import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTrim, type TrimMode } from '../context/TrimContext'
import { getApiKey, getEffectiveConditions } from '../lib/gemini'
import ApiKeyModal from './ApiKeyModal'
import ApiKeyGuide from './ApiKeyGuide'
import TrimAnalyzer from './TrimAnalyzer'

const MODES: { value: TrimMode; icon: string; labelKey: string; descKey: string }[] = [
  { value: 'manual', icon: '🎛️', labelKey: 'manual', descKey: 'manual' },
  { value: 'demo', icon: '🌀', labelKey: 'demo', descKey: 'demo' },
  { value: 'live', icon: '📡', labelKey: 'live', descKey: 'live' },
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
  const { t } = useTranslation()

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

  const boatLabel = t(`boatTypes.${effective.boatType}`)
  const expLabel = t(`experience.${effective.experience}`)
  const beaufortInfo = t(`beaufort.${effective.force}`, { returnObjects: true }) as { label: string; description: string; windSpeed: string; seaState: string }
  const windAngleData = t(`windAngles.${effective.angle}`, { returnObjects: true }) as { short: string; full: string }
  const angleLabel = windAngleData?.short ?? `${effective.angle}°`
  const windText =
    effective.speedKnots !== null
      ? `${effective.speedKnots.toFixed(1)} kn · F${effective.force}`
      : `${beaufortInfo?.windSpeed || ''} · F${effective.force}`

  const getSeaLabelKey = () => {
    if (effective.seaState === 'calm') return 'seaState.calm'
    if (effective.seaState === 'moderate') return 'seaState.moderate'
    if (effective.seaState === 'rough') return 'seaState.rough'
    return 'seaState.none'
  }
  const seaText = t(getSeaLabelKey())

  const chips = [
    { icon: '🚢', label: t('dashboard.barco'), value: boatLabel },
    { icon: '🧭', label: t('dashboard.angulo'), value: `${effective.angle}° ${angleLabel}` },
    { icon: '💨', label: t('dashboard.viento'), value: windText },
    { icon: '🌊', label: t('dashboard.mar'), value: seaText },
    { icon: '🎓', label: t('dashboard.nivel'), value: expLabel },
  ]

  return (
    <section id="assistant" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-wind-400 text-sm font-semibold tracking-widest uppercase">
            {t('dashboard.step')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            {t('dashboard.title')}
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            {t('dashboard.subtitle')}
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
                    {t(`dashboard.modes.${m.labelKey}.label`)}
                  </span>
                  <span className={`text-[11px] ${selected ? 'text-white/80' : 'text-sail-600'}`}>
                    {t(`dashboard.modes.${m.descKey}.desc`)}
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
                {t('dashboard.currentConditions')}
                {mode !== 'manual' && (
                  <span className="text-[10px] normal-case font-normal text-sail-700">
                    · {t('dashboard.realtime')}
                  </span>
                )}
              </span>
              <span className="text-sail-700 text-xs">
                {mode === 'manual'
                  ? t('dashboard.manualConfig')
                  : mode === 'demo'
                    ? t('dashboard.simulator')
                    : t('dashboard.instruments')}
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
                  {keyConfigured ? t('dashboard.keyConfigured') : t('dashboard.keyMissing')}
                </p>
                <p className="text-xs text-sail-600">
                  {t('dashboard.keySubtitle')}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                onClick={openApiKey}
                className="px-5 py-2.5 bg-wind-500/15 border border-wind-500/30 hover:bg-wind-500/25 text-wind-300 font-semibold text-sm rounded-xl transition-all duration-300 active:scale-[0.98]"
              >
                {keyConfigured ? t('dashboard.changeKey') : t('dashboard.configureKey')}
              </button>
              <button
                onClick={openGuide}
                className="px-5 py-2.5 text-sail-500 hover:text-sail-300 border border-ocean-700/40 hover:border-ocean-600/60 text-sm font-medium rounded-xl transition-all duration-300 active:scale-[0.98]"
              >
                {t('dashboard.howToGetKey')}
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
