import { useCallback, useState, type ReactNode } from 'react'
import type { BeaufortForce, BoatType, DouglasScale, ExperienceLevel, TrimConditions, WindAngle } from '../types'
import { TrimContext, type LiveWind, type TrimMode } from './trim-context'

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

  const setSeaState = useCallback((seaState?: DouglasScale) => {
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
