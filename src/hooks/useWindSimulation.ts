import { useState, useRef, useCallback, useEffect } from 'react'
import type { BeaufortForce, WindAngle } from '../types'

export interface SimulatedWind {
  direction: number
  speedKnots: number
  force: BeaufortForce
  gustKnots: number | null
  trend: 'steady' | 'increasing' | 'decreasing' | 'backing' | 'veering'
}

function knotsToBeaufort(knots: number): BeaufortForce {
  if (knots < 1) return 0
  if (knots < 4) return 1
  if (knots < 7) return 2
  if (knots < 11) return 3
  if (knots < 17) return 4
  if (knots < 22) return 5
  if (knots < 28) return 6
  if (knots < 34) return 7
  if (knots < 41) return 8
  if (knots < 48) return 9
  if (knots < 56) return 10
  if (knots < 64) return 11
  return 12
}

function toWindAngle(degrees: number): WindAngle {
  let deg = degrees % 360
  if (deg > 180) deg = 360 - deg
  return (Math.round(deg / 15) * 15) as WindAngle
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function useWindSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [wind, setWind] = useState<SimulatedWind>({
    direction: 45,
    speedKnots: 12,
    force: 4,
    gustKnots: null,
    trend: 'steady',
  })

  const stateRef = useRef({
    direction: 45,
    targetDirection: 45,
    baseSpeed: 12,
    targetSpeed: 12,
    oscillation: 0,
    gustTimer: 0,
    gustActive: false,
    gustStrength: 0,
    prevSpeed: 12,
    prevDirection: 45,
    directionChangeTimer: 0,
  })

  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!isRunning) return

    let lastTime = performance.now()

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      const s = stateRef.current

      s.directionChangeTimer -= dt
      if (s.directionChangeTimer <= 0) {
        s.targetDirection = s.targetDirection + (Math.random() - 0.5) * 40
        s.targetDirection = ((s.targetDirection % 360) + 360) % 360
        s.directionChangeTimer = 3 + Math.random() * 7
      }

      s.direction = lerp(s.direction, s.targetDirection, dt * 0.3)

      s.oscillation = lerp(s.oscillation, (Math.random() - 0.5) * 8, dt * 2)

      const speedChangeTimer = s.directionChangeTimer
      if (speedChangeTimer <= 0.5) {
        s.targetSpeed = 8 + Math.random() * 20
        s.targetSpeed = Math.max(0, Math.min(50, s.targetSpeed))
      }

      s.baseSpeed = lerp(s.baseSpeed, s.targetSpeed, dt * 0.15)

      s.gustTimer -= dt
      if (s.gustTimer <= 0) {
        if (s.gustActive) {
          s.gustActive = false
          s.gustStrength = 0
          s.gustTimer = 5 + Math.random() * 15
        } else if (Math.random() < 0.3) {
          s.gustActive = true
          s.gustStrength = 3 + Math.random() * 12
          s.gustTimer = 2 + Math.random() * 4
        } else {
          s.gustTimer = 3 + Math.random() * 10
        }
      }

      if (s.gustActive) {
        const gustProgress = 1 - s.gustTimer / 4
        const envelope = Math.sin(gustProgress * Math.PI)
        s.gustStrength = lerp(s.gustStrength, (3 + Math.random() * 12) * envelope, dt * 1.5)
      }

      const rawDirection = s.direction + s.oscillation
      const clampedDirection = ((rawDirection % 360) + 360) % 360
      const currentSpeed = s.baseSpeed + s.gustStrength

      let trend: SimulatedWind['trend'] = 'steady'
      const dirDiff = clampedDirection - s.prevDirection
      const speedDiff = currentSpeed - s.prevSpeed
      if (Math.abs(speedDiff) > 0.3) {
        trend = speedDiff > 0 ? 'increasing' : 'decreasing'
      } else if (Math.abs(dirDiff) > 1) {
        trend = dirDiff > 0 ? 'veering' : 'backing'
      }

      s.prevDirection = clampedDirection
      s.prevSpeed = currentSpeed

      setWind({
        direction: Math.round(clampedDirection),
        speedKnots: Math.round(currentSpeed * 10) / 10,
        force: knotsToBeaufort(currentSpeed),
        gustKnots: s.gustActive ? Math.round(s.gustStrength * 10) / 10 : null,
        trend,
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isRunning])

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const windAngle = toWindAngle(wind.direction)

  return { isRunning, wind, windAngle, toggle }
}
