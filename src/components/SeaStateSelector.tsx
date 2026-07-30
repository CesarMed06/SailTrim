interface SeaStateSelectorProps {
  value?: 'calm' | 'moderate' | 'rough'
  onChange: (value?: 'calm' | 'moderate' | 'rough') => void
}

const SEA_STATES = [
  { value: 'calm' as const, label: 'Calma', icon: '🌊' },
  { value: 'moderate' as const, label: 'Moderada', icon: '🌊' },
  { value: 'rough' as const, label: 'Gruesa', icon: '🌊' },
]

function SeaStateSelector({ value, onChange }: SeaStateSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {SEA_STATES.map((state) => {
        const selected = value === state.value
        return (
          <button
            key={state.value}
            onClick={() => onChange(selected ? undefined : state.value)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
              selected
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'border-ocean-700/40 text-sail-500 hover:text-sail-300 hover:border-ocean-600/50 hover:bg-ocean-900/30'
            }`}
          >
            <span className="text-lg">{state.icon}</span>
            {state.label}
          </button>
        )
      })}
    </div>
  )
}

export default SeaStateSelector
