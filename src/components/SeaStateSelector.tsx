import { useTranslation } from 'react-i18next'

interface SeaStateSelectorProps {
  value?: 'calm' | 'moderate' | 'rough'
  onChange: (value?: 'calm' | 'moderate' | 'rough') => void
}

const SEA_VALUES = ['calm', 'moderate', 'rough'] as const

function SeaStateSelector({ value, onChange }: SeaStateSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {SEA_VALUES.map((state) => {
        const selected = value === state
        return (
          <button
            key={state}
            onClick={() => onChange(selected ? undefined : state)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
              selected
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'border-ocean-700/40 text-sail-500 hover:text-sail-300 hover:border-ocean-600/50 hover:bg-ocean-900/30'
            }`}
          >
            <span className="text-lg">🌊</span>
            {t(`seaState.${state}`)}
          </button>
        )
      })}
    </div>
  )
}

export default SeaStateSelector
