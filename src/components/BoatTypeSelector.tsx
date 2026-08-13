import { useTranslation } from 'react-i18next'
import type { BoatType } from '../types'

interface BoatTypeSelectorProps {
  value: BoatType
  onChange: (value: BoatType) => void
}

const BOAT_VALUES: BoatType[] = ['monohull', 'catamaran', 'trimaran', 'cruiser', 'racer', 'dinghy']

const BOAT_ICONS: Record<string, string> = {
  monohull: '⛵',
  catamaran: '🛥️',
  trimaran: '⛵',
  cruiser: '🚢',
  racer: '🏁',
  dinghy: '🛶',
}

function BoatTypeSelector({ value, onChange }: BoatTypeSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label={t('conditions.boatType')}>
      {BOAT_VALUES.map((boatValue) => {
        const selected = value === boatValue
        const label = t(`boatTypes.${boatValue}`)
        return (
          <button
            key={boatValue}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(boatValue)}
            className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
              selected
                ? 'bg-wind-500/10 border-wind-500/40 shadow-lg shadow-wind-500/10 scale-[1.02]'
                : 'bg-ocean-900/20 border-ocean-800/20 hover:border-ocean-700/40 hover:bg-ocean-900/40'
            }`}
          >
            <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
              {BOAT_ICONS[boatValue]}
            </span>
            <span className={`text-sm font-medium transition-colors duration-300 ${
              selected ? 'text-wind-300' : 'text-sail-400'
            }`}>
              {label}
            </span>
            {selected && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-wind-400 shadow-md shadow-wind-400/50" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default BoatTypeSelector
