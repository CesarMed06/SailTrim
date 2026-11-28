import { useTranslation } from 'react-i18next'
import type { DouglasScale } from '../types'

interface SeaStateSelectorProps {
  value?: DouglasScale
  onChange: (value?: DouglasScale) => void
}

const DOUGLAS: DouglasScale[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function SeaStateSelector({ value, onChange }: SeaStateSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t('conditions.seaState')}>
        {DOUGLAS.map((state) => {
          const selected = value === state
          return (
            <button
              key={state}
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : state)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
                selected
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'border-ocean-700/40 text-sail-500 hover:text-sail-300 hover:border-ocean-600/50 hover:bg-ocean-900/30'
              }`}
            >
              <span className="font-mono font-bold">{state}</span>
              <span>{t(`douglas.${state}.label`)}</span>
            </button>
          )
        })}
      </div>
      {value !== undefined && (
        <p className="text-center text-xs text-sail-600">
          {t('douglas.scale')} {value} · {t(`douglas.${value}.height`)} — {t(`douglas.${value}.description`)}
        </p>
      )}
    </div>
  )
}

export default SeaStateSelector
