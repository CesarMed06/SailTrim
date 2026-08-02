import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { BeaufortForce, BoatType, ExperienceLevel, TrimConditions, WindAngle } from '../types'

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
  setSeaState: (state?: 'calm' | 'moderate' | 'rough') => void
  mode: TrimMode
  setMode: (mode: TrimMode) => void
  liveWind: LiveWind | null
  setLiveWind: (wind: LiveWind | null) => void
}

const TrimContext = createContext<TrimContextValue | null>(null)

export function TrimProvider({ children }: { children: ReactNode }) {
  const [conditions, setConditions] = useState<TrimConditions>({
    boatType: 'monohull',
    windForce: 3,
    windAngle: 45,
    experience: 'intermediate',
    seaState: undefined,
  })
  const [mode, setMode] = useState<TrimMode>('manual')
  const [liveWind, setLiveWind] = useState<LiveWind | null>(null)

  const setWindAngle = useCallback((windAngle: WindAngle) => {
    setConditions((prev) => ({ ...prev, windAngle }))
  }, [])

  const setBoatType = useCallback((boatType: BoatType) => {
    setConditions((prev) => ({ ...prev, boatType }))
  }, [])

  const setWindForce = useCallback((windForce: BeaufortForce) => {
    setConditions((prev) => ({ ...prev, windForce }))
  }, [])

  const setExperience = useCallback((experience: ExperienceLevel) => {
    setConditions((prev) => ({ ...prev, experience }))
  }, [])

  const setSeaState = useCallback((seaState?: 'calm' | 'moderate' | 'rough') => {
    setConditions((prev) => ({ ...prev, seaState }))
  }, [])

  return (
    <TrimContext.Provider
      value={{
        conditions,
        setWindAngle,
        setBoatType,
        setWindForce,
        setExperience,
        setSeaState,
        mode,
        setMode,
        liveWind,
        setLiveWind,
      }}
    >
      {children}
    </TrimContext.Provider>
  )
}

export function useTrim() {
  const ctx = useContext(TrimContext)
  if (!ctx) throw new Error('useTrim debe usarse dentro de TrimProvider')
  return ctx
}
