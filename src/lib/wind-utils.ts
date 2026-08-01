import type { BeaufortForce, WindAngle } from '../types'

export function knotsToBeaufort(knots: number): BeaufortForce {
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

export function toWindAngle(degrees: number): WindAngle {
  let deg = degrees % 360
  if (deg > 180) deg = 360 - deg
  return (Math.round(deg / 15) * 15) as WindAngle
}
