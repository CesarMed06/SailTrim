import { beforeEach, describe, expect, it } from 'vitest'
import { buildBoatContext } from '../boat-context'
import { buildTrimPrompt } from '../gemini'
import type { EffectiveConditions } from '../gemini'

const PROFILE_KEY = 'sailtrim_boat_profile'
const NAV_KEY = 'sailtrim_nav_config'
const CREW_KEY = 'sailtrim_crew_config'

const profile = {
  boatName: 'Tramontana',
  model: 'Bavaria 34',
  lengthMeters: 10.3,
  beamMeters: 3.4,
  draftMeters: 1.8,
  depthMeters: 1.4,
  rigType: 'sloop',
  rigTypeOther: '',
  hullMaterial: 'fiberglass',
  hullMaterialOther: '',
  year: 2008,
}

const nav = {
  priority: 'racing',
  priorityOther: '',
  zone: 'mediterranean',
  zoneOther: '',
  month: 6,
  day: null,
  timeOfDay: 'midday',
  timeOfDayOther: '',
}

const crew = { count: 3, roles: 'patrón y dos tripulantes', notes: '' }

const conditions: EffectiveConditions = {
  angle: 45,
  force: 4,
  speedKnots: null,
  boatType: 'monohull',
  experience: 'intermediate',
  mode: 'manual',
}

beforeEach(() => {
  localStorage.clear()
})

describe('buildBoatContext', () => {
  it('returns an empty string when the boat has no name or model', () => {
    expect(buildBoatContext('es')).toBe('')
  })

  it('ignores a profile with only whitespace', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ boatName: '   ', model: '  ' }))
    expect(buildBoatContext('es')).toBe('')
  })

  it('describes the boat in Spanish', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    localStorage.setItem(NAV_KEY, JSON.stringify(nav))
    localStorage.setItem(CREW_KEY, JSON.stringify(crew))

    const context = buildBoatContext('es')
    expect(context).toContain('BARCO DEL NAVEGANTE:')
    expect(context).toContain('- Nombre: Tramontana')
    expect(context).toContain('- Modelo: Bavaria 34')
    expect(context).toContain('- Dimensiones: eslora 10.3m, manga 3.4m, calado 1.8m, puntal 1.4m')
    expect(context).toContain('- Aparejo: sloop')
    expect(context).toContain('- Casco: fiberglass')
    expect(context).toContain('- Año: 2008')
    expect(context).toContain('- Prioridad: racing')
    expect(context).toContain('- Zona: mediterranean')
    expect(context).toContain('- Mes: 6')
    expect(context).toContain('- Hora del día: midday')
    expect(context).toContain('- Tripulación: 3 personas — roles: patrón y dos tripulantes')
  })

  it('describes the boat in English', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    localStorage.setItem(CREW_KEY, JSON.stringify({ count: 2, roles: '', notes: '' }))

    const context = buildBoatContext('en')
    expect(context).toContain("THE SAILOR'S BOAT:")
    expect(context).toContain('- Name: Tramontana')
    expect(context).toContain('- Dimensions: LOA 10.3m, beam 3.4m, draft 1.8m, depth 1.4m')
    expect(context).toContain('- Rig: sloop')
    expect(context).toContain('- Crew: 2 people')
  })

  it('uses the custom rig and hull text when other is selected', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      ...profile,
      rigType: 'other',
      rigTypeOther: 'Ketch de acero',
      hullMaterial: 'other',
      hullMaterialOther: 'Acero naval',
    }))

    const context = buildBoatContext('es')
    expect(context).toContain('- Aparejo: Ketch de acero')
    expect(context).toContain('- Casco: Acero naval')
  })

  it('omits the crew line when the count is zero', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    localStorage.setItem(CREW_KEY, JSON.stringify({ count: 0, roles: 'patrón', notes: '' }))
    expect(buildBoatContext('es')).not.toContain('Tripulación')
  })

  it('includes the day when it is set', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    localStorage.setItem(NAV_KEY, JSON.stringify({ ...nav, day: 14 }))
    expect(buildBoatContext('es')).toContain('- Mes: 6, día 14')
  })

  it('survives corrupted storage', () => {
    localStorage.setItem(PROFILE_KEY, '{not json')
    expect(buildBoatContext('es')).toBe('')
  })
})

describe('buildTrimPrompt', () => {
  it('includes the sailor boat once a profile exists', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    const prompt = buildTrimPrompt(conditions)
    expect(prompt).toContain('Tramontana')
    expect(prompt).toContain('Bavaria 34')
  })

  it('keeps the conditions and skips the boat block without a profile', () => {
    const prompt = buildTrimPrompt(conditions)
    expect(prompt).not.toContain('Tramontana')
    expect(prompt).not.toContain('BARCO DEL NAVEGANTE')
    expect(prompt).not.toContain("THE SAILOR'S BOAT")
    expect(prompt).toContain('45')
  })
})
