import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useBoatProfile } from '../useBoatProfile'

beforeEach(() => {
  localStorage.clear()
})

describe('useBoatProfile', () => {
  it('returns default profile values', () => {
    const { result } = renderHook(() => useBoatProfile())
    expect(result.current.profile.boatName).toBe('')
    expect(result.current.profile.rigType).toBe('sloop')
    expect(result.current.nav.priority).toBe('speed')
    expect(result.current.crew.count).toBe(2)
  })

  it('is not configured without name or model', () => {
    const { result } = renderHook(() => useBoatProfile())
    expect(result.current.configured).toBe(false)
  })

  it('persists profile to localStorage after update', () => {
    const { result } = renderHook(() => useBoatProfile())

    act(() => {
      result.current.updateProfile({ boatName: 'Alisio', model: 'Bavaria 34' })
    })

    const stored = localStorage.getItem('sailtrim_boat_profile')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.boatName).toBe('Alisio')
    expect(parsed.model).toBe('Bavaria 34')
  })

  it('persists nav config to localStorage', () => {
    const { result } = renderHook(() => useBoatProfile())

    act(() => {
      result.current.updateNav({ priority: 'comfort', zone: 'caribbean' })
    })

    const stored = localStorage.getItem('sailtrim_nav_config')
    const parsed = JSON.parse(stored!)
    expect(parsed.priority).toBe('comfort')
    expect(parsed.zone).toBe('caribbean')
  })

  it('persists crew config to localStorage', () => {
    const { result } = renderHook(() => useBoatProfile())

    act(() => {
      result.current.updateCrew({ count: 4, roles: 'Skipper, Navigator' })
    })

    const stored = localStorage.getItem('sailtrim_crew_config')
    const parsed = JSON.parse(stored!)
    expect(parsed.count).toBe(4)
    expect(parsed.roles).toBe('Skipper, Navigator')
  })

  it('saveAll collapses the panel', () => {
    const { result } = renderHook(() => useBoatProfile())

    act(() => {
      result.current.setExpanded(true)
    })
    expect(result.current.expanded).toBe(true)

    act(() => {
      result.current.saveAll()
    })
    expect(result.current.expanded).toBe(false)
  })

  it('is configured when boatName is set', () => {
    const { result } = renderHook(() => useBoatProfile())

    act(() => {
      result.current.updateProfile({ boatName: 'Alisio' })
    })

    expect(result.current.configured).toBe(true)
  })

  it('updates navigation partial fields without overwriting others', () => {
    const { result } = renderHook(() => useBoatProfile())

    act(() => {
      result.current.updateNav({ priority: 'racing' })
    })
    expect(result.current.nav.priority).toBe('racing')
    expect(result.current.nav.zone).toBe('mediterranean')
  })

  it('loads saved profile from localStorage on mount', () => {
    localStorage.setItem('sailtrim_boat_profile', JSON.stringify({
      boatName: 'SavedBoat',
      model: 'Beneteau 50',
      lengthMeters: 15,
      beamMeters: null,
      draftMeters: null,
      rigType: 'sloop',
      rigTypeOther: '',
      hullMaterial: 'fiberglass',
      hullMaterialOther: '',
      year: null,
    }))
    localStorage.setItem('sailtrim_nav_config', JSON.stringify({
      priority: 'safety',
      priorityOther: '',
      zone: 'north_sea',
      zoneOther: '',
      month: 6,
      day: null,
      timeOfDay: 'morning',
      timeOfDayOther: '',
    }))
    localStorage.setItem('sailtrim_crew_config', JSON.stringify({
      count: 3,
      roles: '',
      notes: '',
    }))

    const { result } = renderHook(() => useBoatProfile())
    expect(result.current.profile.boatName).toBe('SavedBoat')
    expect(result.current.nav.zone).toBe('north_sea')
    expect(result.current.crew.count).toBe(3)
    expect(result.current.configured).toBe(true)
  })
})
