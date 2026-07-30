import { EXPERIENCE_LEVELS } from '../lib/constants'
import type { ExperienceLevel } from '../types'

interface ExperienceToggleProps {
  value: ExperienceLevel
  onChange: (value: ExperienceLevel) => void
}

function ExperienceToggle({ value, onChange }: ExperienceToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex bg-ocean-900/50 border border-ocean-800/30 rounded-full p-1 gap-0.5">
        {EXPERIENCE_LEVELS.map((level) => {
          const selected = value === level.value
          return (
            <button
              key={level.value}
              onClick={() => onChange(level.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selected
                  ? 'bg-wind-500/20 text-wind-300 shadow-lg shadow-wind-500/10'
                  : 'text-sail-500 hover:text-sail-300 hover:bg-ocean-800/30'
              }`}
            >
              {level.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ExperienceToggle
