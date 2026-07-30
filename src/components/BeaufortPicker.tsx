import { useRef, useCallback, useState, useEffect } from 'react'
import type { BeaufortForce } from '../types'
import { BEAUFORT_SCALE } from '../lib/constants'

interface BeaufortPickerProps {
  value: BeaufortForce
  onChange: (value: BeaufortForce) => void
}

const FORCES: BeaufortForce[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const SLIDER_STOPS = FORCES.map((f) => (f / 12) * 100)

const FORCE_COLORS: Record<number, string> = {
  0: 'from-sky-300 via-sky-200 to-blue-200',
  1: 'from-sky-400 via-sky-300 to-blue-300',
  2: 'from-cyan-400 via-sky-400 to-blue-400',
  3: 'from-emerald-400 via-teal-400 to-cyan-400',
  4: 'from-lime-400 via-green-400 to-emerald-400',
  5: 'from-yellow-400 via-amber-400 to-orange-400',
  6: 'from-amber-400 via-orange-400 to-orange-500',
  7: 'from-orange-400 via-orange-500 to-red-400',
  8: 'from-orange-500 via-red-500 to-red-600',
  9: 'from-red-500 via-red-600 to-rose-600',
  10: 'from-red-600 via-rose-600 to-rose-700',
  11: 'from-red-700 via-rose-700 to-fuchsia-700',
  12: 'from-red-800 via-fuchsia-800 to-purple-800',
}

function BeaufortPicker({ value, onChange }: BeaufortPickerProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!dragging) return
    const cleanup = () => setDragging(false)
    window.addEventListener('pointerup', cleanup)
    return () => window.removeEventListener('pointerup', cleanup)
  }, [dragging])

  const getForceFromX = useCallback((clientX: number): BeaufortForce => {
    if (!trackRef.current) return value
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const idx = Math.round(ratio * 12)
    return FORCES[idx]
  }, [value])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true)
    trackRef.current?.setPointerCapture(e.pointerId)
    onChange(getForceFromX(e.clientX))
  }, [getForceFromX, onChange])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    onChange(getForceFromX(e.clientX))
  }, [dragging, getForceFromX, onChange])

  const handlePointerUp = useCallback(() => setDragging(false), [])

  const percent = SLIDER_STOPS[value]
  const info = BEAUFORT_SCALE[value]

  return (
    <div className="select-none touch-none">
      <div
        ref={trackRef}
        className="relative h-14 cursor-pointer rounded-full overflow-hidden border border-ocean-700/30 bg-ocean-900/40"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${FORCE_COLORS[value]} opacity-30 transition-all duration-500`} />

        <div className="absolute inset-0 flex items-center px-1">
          {FORCES.map((f) => (
            <div
              key={f}
              className="flex-1 h-8 flex items-center justify-center relative"
            >
              <div className={`w-px h-3 rounded-full transition-colors duration-300 ${
                f <= value ? 'bg-white/40' : 'bg-white/10'
              }`} />
            </div>
          ))}
        </div>

        <div
          className="absolute top-1 bottom-1 w-6 transition-all duration-150 ease-out"
          style={{ left: `calc(${percent}% - 12px)` }}
        >
          <div className="w-full h-full rounded-full bg-white shadow-lg shadow-black/30 border-2 border-ocean-200 flex items-center justify-center">
            <div className="w-1.5 h-5 rounded-full bg-ocean-800/50" />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center space-y-2">
        <div className="flex items-baseline justify-center gap-3">
          <span className="text-5xl font-mono font-bold text-white tabular-nums">{value}</span>
          <span className="text-sm text-sail-500 uppercase tracking-widest">Beaufort</span>
        </div>
        <p className="text-xl font-display font-semibold text-white">{info.label}</p>
        <p className="text-sail-400 text-sm max-w-xs mx-auto">{info.description}</p>
        <div className="flex justify-center gap-4 text-xs text-sail-600 pt-1">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>
            {info.windSpeed}
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2"/></svg>
            {info.seaState}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BeaufortPicker
