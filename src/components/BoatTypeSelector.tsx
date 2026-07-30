import { BOAT_TYPES } from '../lib/constants'
import type { BoatType } from '../types'

interface BoatTypeSelectorProps {
  value: BoatType
  onChange: (value: BoatType) => void
}

function BoatTypeSelector({ value, onChange }: BoatTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {BOAT_TYPES.map((boat) => {
        const selected = value === boat.value
        return (
          <button
            key={boat.value}
            onClick={() => onChange(boat.value)}
            className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
              selected
                ? 'bg-wind-500/10 border-wind-500/40 shadow-lg shadow-wind-500/10 scale-[1.02]'
                : 'bg-ocean-900/20 border-ocean-800/20 hover:border-ocean-700/40 hover:bg-ocean-900/40'
            }`}
          >
            <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
              {boat.icon}
            </span>
            <span className={`text-sm font-medium transition-colors duration-300 ${
              selected ? 'text-wind-300' : 'text-sail-400'
            }`}>
              {boat.label}
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
