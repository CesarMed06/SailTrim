import { getCurrentLanguage } from '../i18n'
import { BOAT_PROFILE_STORAGE, CREW_CONFIG_STORAGE, NAV_CONFIG_STORAGE } from './constants'

type Lang = 'es' | 'en'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function resolveOther(value: unknown, other: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  if (value === 'other' && typeof other === 'string' && other.trim()) return other.trim()
  return value
}

export function buildBoatContext(lang: Lang = getCurrentLanguage()): string {
  const isEn = lang === 'en'
  const profile = loadJson<Record<string, unknown>>(BOAT_PROFILE_STORAGE, {})
  const nav = loadJson<Record<string, unknown>>(NAV_CONFIG_STORAGE, {})
  const crew = loadJson<Record<string, unknown>>(CREW_CONFIG_STORAGE, {})

  const name = typeof profile.boatName === 'string' ? profile.boatName.trim() : ''
  const model = typeof profile.model === 'string' ? profile.model.trim() : ''
  if (!name && !model) return ''

  const lines: string[] = [isEn ? "THE SAILOR'S BOAT:" : 'BARCO DEL NAVEGANTE:']
  if (name) lines.push(`${isEn ? '- Name' : '- Nombre'}: ${name}`)
  if (model) lines.push(`${isEn ? '- Model' : '- Modelo'}: ${model}`)

  const length = typeof profile.lengthMeters === 'number' ? profile.lengthMeters : 0
  const beam = typeof profile.beamMeters === 'number' ? profile.beamMeters : 0
  const draft = typeof profile.draftMeters === 'number' ? profile.draftMeters : 0
  const depth = typeof profile.depthMeters === 'number' ? profile.depthMeters : 0
  if (length || beam || draft || depth) {
    const dims: string[] = []
    if (length) dims.push(`${isEn ? 'LOA' : 'eslora'} ${length}m`)
    if (beam) dims.push(`${isEn ? 'beam' : 'manga'} ${beam}m`)
    if (draft) dims.push(`${isEn ? 'draft' : 'calado'} ${draft}m`)
    if (depth) dims.push(`${isEn ? 'depth' : 'puntal'} ${depth}m`)
    lines.push(`${isEn ? '- Dimensions' : '- Dimensiones'}: ${dims.join(', ')}`)
  }

  const rig = resolveOther(profile.rigType, profile.rigTypeOther)
  if (rig) lines.push(`${isEn ? '- Rig' : '- Aparejo'}: ${rig}`)

  const hull = resolveOther(profile.hullMaterial, profile.hullMaterialOther)
  if (hull) lines.push(`${isEn ? '- Hull' : '- Casco'}: ${hull}`)

  if (typeof profile.year === 'number') lines.push(`${isEn ? '- Year' : '- Año'}: ${profile.year}`)

  const priority = resolveOther(nav.priority, nav.priorityOther)
  if (priority) lines.push(`${isEn ? '- Priority' : '- Prioridad'}: ${priority}`)

  const zone = resolveOther(nav.zone, nav.zoneOther)
  if (zone) lines.push(`${isEn ? '- Zone' : '- Zona'}: ${zone}`)

  if (typeof nav.month === 'number') {
    const day = typeof nav.day === 'number' ? nav.day : 0
    lines.push(isEn
      ? `- Month: ${nav.month}${day ? `, day ${day}` : ''}`
      : `- Mes: ${nav.month}${day ? `, día ${day}` : ''}`)
  }

  const timeOfDay = resolveOther(nav.timeOfDay, nav.timeOfDayOther)
  if (timeOfDay) lines.push(`${isEn ? '- Time of day' : '- Hora del día'}: ${timeOfDay}`)

  const crewCount = typeof crew.count === 'number' ? crew.count : 0
  if (crewCount > 0) {
    const parts: string[] = [isEn ? `${crewCount} people` : `${crewCount} personas`]
    if (typeof crew.roles === 'string' && crew.roles.trim()) parts.push(`roles: ${crew.roles}`)
    if (typeof crew.notes === 'string' && crew.notes.trim()) parts.push(`${isEn ? 'notes' : 'notas'}: ${crew.notes}`)
    lines.push(`${isEn ? '- Crew' : '- Tripulación'}: ${parts.join(' — ')}`)
  }

  return lines.join('\n')
}
