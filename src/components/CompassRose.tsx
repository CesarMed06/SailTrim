import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { WindAngle } from '../types'

interface CompassRoseProps {
  angle: WindAngle
  onChange: (angle: WindAngle) => void
}

const CENTER = 150
const OUTER_R = 140
const INNER_R = 105
const BOAT_R = 28

function polarToCartesian(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  }
}

function sectorPath(startAngle: number, endAngle: number) {
  const so = polarToCartesian(startAngle, OUTER_R)
  const eo = polarToCartesian(endAngle, OUTER_R)
  const si = polarToCartesian(startAngle, INNER_R)
  const ei = polarToCartesian(endAngle, INNER_R)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${so.x} ${so.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${eo.x} ${eo.y}`,
    `L ${ei.x} ${ei.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${si.x} ${si.y}`,
    'Z',
  ].join(' ')
}

const SECTORS = [
  { start: 0, end: 15, fill: 'rgba(100,100,120,0.15)' },
  { start: 15, end: 45, fill: 'rgba(239,68,68,0.18)' },
  { start: 45, end: 90, fill: 'rgba(249,115,22,0.18)' },
  { start: 90, end: 135, fill: 'rgba(250,204,21,0.16)' },
  { start: 135, end: 180, fill: 'rgba(34,211,238,0.16)' },
]

const TICK_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15)

function CompassRose({ angle, onChange }: CompassRoseProps) {
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const getAngleFromPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return angle
    const rect = svgRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const rad = Math.atan2(clientX - cx, -(clientY - cy))
    let deg = ((rad * 180) / Math.PI + 360) % 360
    if (deg > 180) deg = 360 - deg
    return (Math.round(deg / 15) * 15) as WindAngle
  }, [angle])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true)
    onChange(getAngleFromPoint(e.clientX, e.clientY))
  }, [getAngleFromPoint, onChange])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    onChange(getAngleFromPoint(e.clientX, e.clientY))
  }, [dragging, getAngleFromPoint, onChange])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let next: number | null = null
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = angle - 15
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = angle + 15
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = 180
    if (next === null) return
    e.preventDefault()
    onChange(Math.max(0, Math.min(180, next)) as WindAngle)
  }, [angle, onChange])

  useEffect(() => {
    if (!dragging) return
    const cleanup = () => setDragging(false)
    window.addEventListener('pointerup', cleanup)
    return () => window.removeEventListener('pointerup', cleanup)
  }, [dragging])

  const { t } = useTranslation()
  const windAngleData = t(`windAngles.${angle}`, { returnObjects: true }) as { short: string; full: string } | string
  const windAngleFull = typeof windAngleData === 'string' ? `${angle}°` : windAngleData.full

  const WindArrow = ({ side }: { side: 'starboard' | 'port' }) => {
    const arrowAngle = side === 'starboard' ? angle : 360 - angle
    return (
      <g transform={`rotate(${arrowAngle}, ${CENTER}, ${CENTER})`} className="transition-transform duration-300 ease-out">
        <polygon
          points={`${CENTER},${CENTER - OUTER_R + 4} ${CENTER - 10},${CENTER - OUTER_R + 30} ${CENTER},${CENTER - OUTER_R + 22} ${CENTER + 10},${CENTER - OUTER_R + 30}`}
          fill="rgba(255,255,255,0.85)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          filter="url(#glow)"
        />
        <line
          x1={CENTER}
          y1={CENTER - OUTER_R + 30}
          x2={CENTER}
          y2={CENTER + BOAT_R + 4}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
      </g>
    )
  }

  return (
    <div className="relative select-none touch-none">
      <svg
        ref={svgRef}
        viewBox="0 0 300 300"
        className="w-full max-w-[350px] md:max-w-[400px] mx-auto cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-wind-400/50 rounded-xl"
        role="slider"
        aria-label={t('compass.ariaLabel')}
        aria-valuenow={angle}
        aria-valuemin={0}
        aria-valuemax={180}
        aria-valuetext={windAngleFull}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(30,41,59,1)" />
            <stop offset="85%" stopColor="rgba(15,23,42,1)" />
            <stop offset="100%" stopColor="rgba(2,8,23,1)" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="url(#compassBg)" stroke="rgba(100,116,139,0.2)" strokeWidth="1" />

        {SECTORS.map((s) => (
          <path
            key={`starboard-${s.start}`}
            d={sectorPath(s.start, s.end)}
            fill={s.fill}
          />
        ))}
        {SECTORS.map((s) => (
          <path
            key={`port-${s.start}`}
            d={sectorPath(360 - s.end, 360 - s.start)}
            fill={s.fill}
          />
        ))}

        <circle cx={CENTER} cy={CENTER} r={INNER_R} fill="rgba(15,23,42,0.9)" stroke="rgba(100,116,139,0.15)" strokeWidth="1" />

        {TICK_ANGLES.map((tickAngle) => {
          const isMajor = tickAngle % 45 === 0
          const r1 = isMajor ? OUTER_R - 4 : OUTER_R - 2
          const r2 = isMajor ? OUTER_R - 16 : OUTER_R - 10
          const outer = polarToCartesian(tickAngle, r1)
          const inner = polarToCartesian(tickAngle, r2)
          const isHighlighted = tickAngle === angle || tickAngle === 360 - angle

          return (
            <line
              key={`tick-${tickAngle}`}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={isHighlighted ? 'rgba(255,255,255,0.9)' : isMajor ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)'}
              strokeWidth={isHighlighted ? 2.5 : isMajor ? 1.5 : 0.8}
              className="transition-all duration-300"
            />
          )
        })}

        <text x={CENTER} y={CENTER - OUTER_R + 16} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600">0°</text>
        <text x={CENTER + OUTER_R - 16} y={CENTER + 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Inter, sans-serif">90°</text>
        <text x={CENTER} y={CENTER + OUTER_R - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Inter, sans-serif">180°</text>
        <text x={CENTER - OUTER_R + 16} y={CENTER + 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Inter, sans-serif">90°</text>

        <WindArrow side="starboard" />
        {angle !== 0 && angle !== 180 && <WindArrow side="port" />}

        <circle cx={CENTER} cy={CENTER} r={BOAT_R} fill="rgba(15,23,42,0.95)" stroke="rgba(100,116,139,0.25)" strokeWidth="1" />

        <g transform={`translate(${CENTER}, ${CENTER})`}>
          <polygon
            points="0,-20 -10,10 0,6 10,10"
            fill="rgba(255,255,255,0.9)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
          <line x1="-10" y1="-10" x2="10" y2="-10" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
        </g>
      </svg>

      <div className="text-center mt-4 space-y-1 transition-all duration-300">
        <div className="text-4xl font-mono font-bold text-white tabular-nums">
          {angle}°
        </div>
        <p className="text-sail-400 text-lg font-medium">
          {windAngleFull}
        </p>
        <p className="text-sail-700 text-xs">
          {t('compass.dragHint')}
        </p>
      </div>
    </div>
  )
}

export default CompassRose
