import { createContext, useContext } from 'react'
import type { BeaufortForce, BoatType, DouglasScale, ExperienceLevel, TrimConditions, WindAngle } from '../types'

export type TrimMode = 'manual' | 'demo' | 'live'

export interface LiveWind {
  direction: number
  speedKnots: number
  force: BeaufortForce
}

interface TrimContextValue {
  conditions: TrimConditions
  setWindAngle: (angle: WindAngle) => void
  setBoatType: (boat: BoatType) => void
  setWindForce: (force: BeaufortForce) => void
  setExperience: (level: ExperienceLevel) => void
  setSeaState: (state?: DouglasScale) => void
  mode: TrimMode
  setMode: (mode: TrimMode) => void
  liveWind: LiveWind | null
  setLiveWind: (wind: LiveWind | null) => void
}

export const TrimContext = createContext<TrimContextValue | null>(null)

export function useTrim() {
  const ctx = useContext(TrimContext)
  if (!ctx) throw new Error('useTrim debe usarse dentro de TrimProvider')
  return ctx
}
