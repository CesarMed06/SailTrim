import { useState, useCallback, useEffect } from 'react'

export type RigType = 'sloop' | 'ketch' | 'yawl' | 'cutter' | 'catamaran' | 'schooner' | 'other'
export type HullMaterial = 'fiberglass' | 'aluminum' | 'steel' | 'wood' | 'carbon' | 'other'
export type NavigationPriority = 'speed' | 'comfort' | 'racing' | 'safety' | 'passage' | 'other'
export type NavigationZone = 'mediterranean' | 'atlantic' | 'caribbean' | 'pacific' | 'cantabrian' | 'baltic' | 'north_sea' | 'indian_ocean' | 'other'
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'night' | 'other'

export interface BoatProfile {
  boatName: string
  model: string
  lengthMeters: number | null
  beamMeters: number | null
  draftMeters: number | null
  rigType: RigType
  rigTypeOther: string
  hullMaterial: HullMaterial
  hullMaterialOther: string
  year: number | null
}

export interface NavigationConfig {
  priority: NavigationPriority
  priorityOther: string
  zone: NavigationZone
  zoneOther: string
  month: number
  day: number | null
  timeOfDay: TimeOfDay
  timeOfDayOther: string
}

export interface CrewConfig {
  count: number
  roles: string
  notes: string
}

const EMPTY_PROFILE: BoatProfile = {
  boatName: '',
  model: '',
  lengthMeters: null,
  beamMeters: null,
  draftMeters: null,
  rigType: 'sloop',
  rigTypeOther: '',
  hullMaterial: 'fiberglass',
  hullMaterialOther: '',
  year: null,
}

const EMPTY_NAV: NavigationConfig = {
  priority: 'speed',
  priorityOther: '',
  zone: 'mediterranean',
  zoneOther: '',
  month: new Date().getMonth() + 1,
  day: null,
  timeOfDay: 'midday' as TimeOfDay,
  timeOfDayOther: '',
}

const EMPTY_CREW: CrewConfig = { count: 2, roles: '', notes: '' }

const PROFILE_KEY = 'sailtrim_boat_profile'
const NAV_KEY = 'sailtrim_nav_config'
const CREW_KEY = 'sailtrim_crew_config'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* localStorage full — silently degrade */ }
}

export function useBoatProfile() {
  const [profile, setProfile] = useState<BoatProfile>(() => load(PROFILE_KEY, EMPTY_PROFILE))
  const [nav, setNav] = useState<NavigationConfig>(() => load(NAV_KEY, EMPTY_NAV))
  const [crew, setCrew] = useState<CrewConfig>(() => load(CREW_KEY, EMPTY_CREW))
  const [expanded, setExpanded] = useState(false)

  useEffect(() => { save(PROFILE_KEY, profile) }, [profile])
  useEffect(() => { save(NAV_KEY, nav) }, [nav])
  useEffect(() => { save(CREW_KEY, crew) }, [crew])

  const updateProfile = useCallback((patch: Partial<BoatProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateNav = useCallback((patch: Partial<NavigationConfig>) => {
    setNav((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateCrew = useCallback((patch: Partial<CrewConfig>) => {
    setCrew((prev) => ({ ...prev, ...patch }))
  }, [])

  const saveAll = useCallback(() => {
    setExpanded(false)
  }, [])

  const configured = !!(profile.boatName || profile.model)

  return {
    profile,
    nav,
    crew,
    expanded,
    configured,
    hasProfile: configured,
    setExpanded,
    updateProfile,
    updateNav,
    updateCrew,
    saveAll,
  }
}
