import { useTranslation } from 'react-i18next'
import type { ExperienceLevel } from '../types'

interface ExperienceToggleProps {
  value: ExperienceLevel
  onChange: (value: ExperienceLevel) => void
}

const LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced']

function ExperienceToggle({ value, onChange }: ExperienceToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex bg-ocean-900/50 border border-ocean-800/30 rounded-full p-1 gap-0.5" role="radiogroup" aria-label={t('conditions.experience')}>
        {LEVELS.map((level) => {
          const selected = value === level
          return (
            <button
              key={level}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(level)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selected
                  ? 'bg-wind-500/20 text-wind-300 shadow-lg shadow-wind-500/10'
                  : 'text-sail-500 hover:text-sail-300 hover:bg-ocean-800/30'
              }`}
            >
              {t(`experience.${level}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ExperienceToggle
