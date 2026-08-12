import { getApiKey } from './gemini'
import type { EffectiveConditions } from './gemini'
import i18n, { getCurrentLanguage } from '../i18n'

const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']

const PROFILE_KEY = 'sailtrim_boat_profile'
const NAV_KEY = 'sailtrim_nav_config'
const CREW_KEY = 'sailtrim_crew_config'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function buildBoatContext(): string {
  const lang = getCurrentLanguage()
  const isEn = lang === 'en'

  const profile = loadJson<Record<string, unknown>>(PROFILE_KEY, {})
  const nav = loadJson<Record<string, unknown>>(NAV_KEY, {})
  const crew = loadJson<Record<string, unknown>>(CREW_KEY, {})

  const hasName = typeof profile.boatName === 'string' && profile.boatName.trim()
  const hasModel = typeof profile.model === 'string' && profile.model.trim()
  if (!hasName && !hasModel) return ''

  const lines: string[] = []

  if (isEn) {
    lines.push('THE SAILOR\'S BOAT:')
    if (hasName) lines.push(`- Name: ${(profile.boatName as string).trim()}`)
    if (hasModel) lines.push(`- Model: ${(profile.model as string).trim()}`)
    const length = typeof profile.lengthMeters === 'number' ? profile.lengthMeters : null
    const beam = typeof profile.beamMeters === 'number' ? profile.beamMeters : null
    const draft = typeof profile.draftMeters === 'number' ? profile.draftMeters : null
    if (length || beam || draft) {
      const dims: string[] = []
      if (length) dims.push(`LOA ${length}m`)
      if (beam) dims.push(`beam ${beam}m`)
      if (draft) dims.push(`draft ${draft}m`)
      lines.push(`- Dimensions: ${dims.join(', ')}`)
    }
    if (typeof profile.rigType === 'string') {
      const rig = profile.rigType === 'other' && typeof profile.rigTypeOther === 'string' && profile.rigTypeOther.trim()
        ? profile.rigTypeOther
        : profile.rigType
      lines.push(`- Rig: ${rig}`)
    }
    if (typeof profile.hullMaterial === 'string') {
      const mat = profile.hullMaterial === 'other' && typeof profile.hullMaterialOther === 'string' && profile.hullMaterialOther.trim()
        ? profile.hullMaterialOther
        : profile.hullMaterial
      lines.push(`- Hull: ${mat}`)
    }
    if (typeof profile.year === 'number') lines.push(`- Year: ${profile.year}`)

    if (typeof nav.priority === 'string') {
      const priority = nav.priority === 'other' && typeof nav.priorityOther === 'string' && nav.priorityOther.trim()
        ? nav.priorityOther
        : nav.priority
      lines.push(`- Priority: ${priority}`)
    }
    if (typeof nav.zone === 'string') {
      const zone = nav.zone === 'other' && typeof nav.zoneOther === 'string' && nav.zoneOther.trim()
        ? nav.zoneOther
        : nav.zone
      lines.push(`- Zone: ${zone}`)
    }
    if (typeof nav.month === 'number') {
      const day = typeof nav.day === 'number' ? nav.day : null
      lines.push(`- Month: ${nav.month}${day ? `, day ${day}` : ''}`)
    }
    if (typeof nav.timeOfDay === 'string') {
      const tod = nav.timeOfDay === 'other' && typeof nav.timeOfDayOther === 'string' && nav.timeOfDayOther.trim()
        ? nav.timeOfDayOther
        : nav.timeOfDay
      lines.push(`- Time of day: ${tod}`)
    }

    const crewCount = typeof crew.count === 'number' ? crew.count : 0
    if (crewCount > 0) {
      const crewParts: string[] = [`${crewCount} people`]
      if (typeof crew.roles === 'string' && crew.roles.trim()) crewParts.push(`roles: ${crew.roles}`)
      if (typeof crew.notes === 'string' && crew.notes.trim()) crewParts.push(`notes: ${crew.notes}`)
      lines.push(`- Crew: ${crewParts.join(' — ')}`)
    }
  } else {
    lines.push('BARCO DEL NAVEGANTE:')
    if (hasName) lines.push(`- Nombre: ${(profile.boatName as string).trim()}`)
    if (hasModel) lines.push(`- Modelo: ${(profile.model as string).trim()}`)
    const length = typeof profile.lengthMeters === 'number' ? profile.lengthMeters : null
    const beam = typeof profile.beamMeters === 'number' ? profile.beamMeters : null
    const draft = typeof profile.draftMeters === 'number' ? profile.draftMeters : null
    if (length || beam || draft) {
      const dims: string[] = []
      if (length) dims.push(`eslora ${length}m`)
      if (beam) dims.push(`manga ${beam}m`)
      if (draft) dims.push(`calado ${draft}m`)
      lines.push(`- Dimensiones: ${dims.join(', ')}`)
    }
    if (typeof profile.rigType === 'string') {
      const rig = profile.rigType === 'other' && typeof profile.rigTypeOther === 'string' && profile.rigTypeOther.trim()
        ? profile.rigTypeOther
        : profile.rigType
      lines.push(`- Aparejo: ${rig}`)
    }
    if (typeof profile.hullMaterial === 'string') {
      const mat = profile.hullMaterial === 'other' && typeof profile.hullMaterialOther === 'string' && profile.hullMaterialOther.trim()
        ? profile.hullMaterialOther
        : profile.hullMaterial
      lines.push(`- Casco: ${mat}`)
    }
    if (typeof profile.year === 'number') lines.push(`- Año: ${profile.year}`)

    if (typeof nav.priority === 'string') {
      const priority = nav.priority === 'other' && typeof nav.priorityOther === 'string' && nav.priorityOther.trim()
        ? nav.priorityOther
        : nav.priority
      lines.push(`- Prioridad: ${priority}`)
    }
    if (typeof nav.zone === 'string') {
      const zone = nav.zone === 'other' && typeof nav.zoneOther === 'string' && nav.zoneOther.trim()
        ? nav.zoneOther
        : nav.zone
      lines.push(`- Zona: ${zone}`)
    }
    if (typeof nav.month === 'number') {
      const day = typeof nav.day === 'number' ? nav.day : null
      lines.push(`- Mes: ${nav.month}${day ? `, día ${day}` : ''}`)
    }
    if (typeof nav.timeOfDay === 'string') {
      const tod = nav.timeOfDay === 'other' && typeof nav.timeOfDayOther === 'string' && nav.timeOfDayOther.trim()
        ? nav.timeOfDayOther
        : nav.timeOfDay
      lines.push(`- Hora del día: ${tod}`)
    }

    const crewCount = typeof crew.count === 'number' ? crew.count : 0
    if (crewCount > 0) {
      const crewParts: string[] = [`${crewCount} personas`]
      if (typeof crew.roles === 'string' && crew.roles.trim()) crewParts.push(`roles: ${crew.roles}`)
      if (typeof crew.notes === 'string' && crew.notes.trim()) crewParts.push(`notas: ${crew.notes}`)
      lines.push(`- Tripulación: ${crewParts.join(' — ')}`)
    }
  }

  return lines.join('\n')
}

export interface ChatEntry {
  role: 'user' | 'assistant'
  content: string
  images?: string[]
}

export type ChatTone = 'casual' | 'formal' | 'tecnico' | 'principiante'

export const TONE_LABELS: Record<ChatTone, string> = {
  casual: '🎙️ Casual',
  formal: '📻 Radio VHF',
  tecnico: '🔧 Técnico',
  principiante: '🧑‍🎓 Paciente',
}

function describeConditionsBrief(c: EffectiveConditions): string {
  const lang = getCurrentLanguage()
  const isEn = lang === 'en'

  const boat = i18n.t(`boatTypes.${c.boatType}`, { lng: lang })
  const exp = i18n.t(`experience.${c.experience}`, { lng: lang })
  const beaufort = i18n.t(`beaufort.${c.force}`, { lng: lang, returnObjects: true }) as { label: string; description: string; windSpeed: string; seaState: string }
  const windAngleData = i18n.t(`windAngles.${c.angle}`, { lng: lang, returnObjects: true }) as { short: string; full: string }
  const angle = windAngleData?.short ?? `${c.angle}°`
  const wind = c.speedKnots !== null ? `${c.speedKnots.toFixed(1)} ${isEn ? 'knots' : 'nudos'}` : (beaufort?.windSpeed || '')
  const source =
    c.mode === 'manual'
      ? isEn ? 'manual config' : 'configuración manual'
      : c.mode === 'demo'
        ? isEn ? 'real-time simulation' : 'simulación en tiempo real'
        : isEn ? 'real boat data (NMEA/SignalK)' : 'datos reales del barco (NMEA/SignalK)'
  return [
    isEn ? `Boat: ${boat}` : `Embarcación: ${boat}`,
    isEn ? `Heading: ${c.angle}° (${angle})` : `Rumbo: ${c.angle}° (${angle})`,
    isEn ? `Wind: ${wind}, force ${c.force} (${beaufort?.label || ''})` : `Viento: ${wind}, fuerza ${c.force} (${beaufort?.label || ''})`,
    isEn ? `Level: ${exp}` : `Nivel: ${exp}`,
    isEn ? `Source: ${source}` : `Origen: ${source}`,
  ].join(' | ')
}

function chatSystemPrompt(tone: ChatTone): string {
  const lang = getCurrentLanguage()
  const isEn = lang === 'en'
  const boatContext = buildBoatContext()

  const baseEs = `Eres un instructor de vela oceánica con décadas de experiencia. Hablas en español con terminología marinera real: ceñida, través, descuartelar, aleta, empopada, mayor, foque, escota, traveller, cunningham, pajarín, rizos, backstay, carro de escota.
${boatContext ? `\n${boatContext}\n` : ''}

Reglas:
- No te presentes ni saludes. No digas tu experiencia ni uses frases como "hola", "ahoy", "soy un instructor con X años". Empieza directo.
- Sé conciso y directo.
- Usa negrita (**texto**) para los términos importantes.
- No uses cursiva ni asteriscos sueltos.
- Escribe en minúscula tras dos puntos (:), salvo nombres propios.
- Al final de tu respuesta, añade la sección ## 💭 Preguntas con 2-3 sugerencias de continuación en formato lista. No uses listas numeradas en las preguntas sugeridas.
- Si usas una lista numerada en tu respuesta, escribe cada paso así: "1. texto" (número, punto, espacio, texto en la MISMA línea, nunca con saltos de línea entre el número y el texto).`

  const baseEn = `You are an ocean sailing instructor with decades of experience. Speak in real English maritime terminology: close-hauled, beam reach, broad reach, running, mainsail, jib, sheet, traveller, cunningham, outhaul, reefs, backstay, fairleads.
${boatContext ? `\n${boatContext}\n` : ''}

Rules:
- Do not introduce yourself or greet. Do not mention your experience or use phrases like "hello", "ahoy", or "I'm an instructor with X years". Get straight to the point.
- Be concise and direct.
- Use bold (**text**) for important terms.
- No italics or loose asterisks.
- Write in lowercase after colons (:), except proper nouns.
- At the end of your response, add the ## 💭 Questions section with 2-3 follow-up suggestions in list format. Do not use numbered lists in the suggested questions.
- If you use a numbered list in your response, write each step like this: "1. text" (number, period, space, text on the SAME line, never with line breaks between the number and the text).`

  const tonesEs: Record<ChatTone, string> = {
    casual: 'Responde con naturalidad, como un patrón experimentado hablando con su tripulación por radio VHF. Usa expresiones coloquiales de la mar.',
    formal: 'Responde con formalidad náutica, como un capitán dirigiéndose a su oficial. Lenguaje correcto y preciso.',
    tecnico: 'Responde con máxima precisión técnica. Usa ángulos exactos, nombres de cabos específicos y detalles de regata de alto nivel. Para navegantes avanzados.',
    principiante: 'Responde como un instructor paciente con un grumete. Explica cada término náutico entre paréntesis. Usa analogías sencillas y pasos muy claros. Para quien acaba de empezar.',
  }

  const tonesEn: Record<ChatTone, string> = {
    casual: 'Respond naturally, like an experienced skipper talking to their crew over VHF radio. Use casual maritime expressions.',
    formal: 'Respond with nautical formality, like a captain addressing their officer. Correct and precise language.',
    tecnico: 'Respond with maximum technical precision. Use exact angles, specific line names, and high-level racing details. For advanced sailors.',
    principiante: 'Respond like a patient instructor with a deckhand. Explain every nautical term in parentheses. Use simple analogies and very clear steps. For beginners.',
  }

  return isEn
    ? `${baseEn}\n${tonesEn[tone]}`
    : `${baseEs}\n${tonesEs[tone]}`
}

function getDiagnosticPrompt(): string {
  const lang = getCurrentLanguage()
  const isEn = lang === 'en'
  const boatContext = buildBoatContext()
  const prefix = boatContext ? `
${boatContext}
` : ''

  if (isEn) {
    return `You are a sailing instructor expert in diagnosing trim problems. Speak in English with real maritime terminology.${prefix}
Your task: the sailor describes a symptom ("the boat heels a lot", "I can't point upwind", "the mainsail is flapping") and you diagnose the most likely cause and give a concrete solution.

Rules:
- Do not introduce yourself or greet. Start directly with the diagnosis.
- Be concise and direct.
- Use bold (**text**) for important terms.
- No italics or loose asterisks.
- Structure your response: first the diagnosis (what's happening), then the solution (what to do).
- At the end, add the ## 💭 Questions section with 1-2 follow-up suggestions.`
  }

  return `Eres un instructor de vela experto en diagnosticar problemas de trimado. Hablas en español con terminología marinera real.${prefix}
Tu tarea: el navegante te describe un síntoma ("el barco escora mucho", "no puedo ceñir", "la mayor flamea") y tú diagnosticas la causa más probable y das la solución concreta.

Reglas:
- No te presentes ni saludes. Empieza directo con el diagnóstico.
- Sé conciso y directo.
- Usa negrita (**texto**) para los términos importantes.
- No uses cursiva ni asteriscos sueltos.
- Estructura tu respuesta: primero el diagnóstico (qué está pasando), luego la solución (qué hacer).
- Al final, añade la sección ## 💭 Preguntas con 1-2 sugerencias de continuación.`
}

export function parseSuggestedQuestions(content: string): string[] {
  const marker = '## 💭 Preguntas'
  const markerEn = '## 💭 Questions'
  let idx = content.indexOf(marker)
  if (idx === -1) idx = content.indexOf(markerEn)
  if (idx === -1) return []
  const section = content.slice(idx + (content.indexOf(marker) !== -1 ? marker.length : markerEn.length))
  const questions: string[] = []
  for (const line of section.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const q = trimmed.slice(2).trim()
      if (q) questions.push(q)
    } else {
      const numbered = trimmed.match(/^\d+[.)]\s+(.+)/)
      if (numbered) questions.push(numbered[1].trim())
    }
  }
  return questions.slice(0, 3)
}

export function stripSuggestedQuestions(content: string): string {
  const marker = '## 💭 Preguntas'
  const markerEn = '## 💭 Questions'
  const idx = content.indexOf(marker)
  const idxEn = content.indexOf(markerEn)
  if (idx !== -1) return content.slice(0, idx).trimEnd()
  if (idxEn !== -1) return content.slice(0, idxEn).trimEnd()
  return content
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } }

function buildContents(
  history: ChatEntry[],
  conditions: EffectiveConditions,
  isDiagnostic: boolean,
): { role: string; parts: GeminiPart[] }[] {
  const isEn = getCurrentLanguage() === 'en'
  const prefix = isDiagnostic
    ? (isEn ? 'Diagnostic mode. The sailor describes a symptom and expects you to figure out what is wrong and how to fix it. Current conditions:' : 'Modo diagnóstico. El navegante describe un síntoma y espera que averigües qué falla y cómo arreglarlo. Condiciones actuales:')
    : (isEn ? 'Current boat conditions:' : 'Condiciones actuales del barco:')
  const contextLine = `${prefix} ${describeConditionsBrief(conditions)}.`
  const systemNote = {
    role: 'user' as const,
    parts: [{ text: contextLine }] as GeminiPart[],
  }
  const response = { role: 'model' as const, parts: [{ text: isEn ? 'Understood.' : 'Entendido.' }] as GeminiPart[] }
  const messages: { role: string; parts: GeminiPart[] }[] = [systemNote, response]
  for (const msg of history) {
    const role = msg.role === 'user' ? 'user' : 'model'
    const parts: GeminiPart[] = []
    if (msg.images && msg.images.length > 0 && msg.role === 'user') {
      for (const dataUrl of msg.images) {
        const mime = dataUrl.match(/^data:(image\/\w+);/)?.at(1) ?? 'image/jpeg'
        const base64 = dataUrl.split(',')[1] ?? ''
        if (base64) {
          parts.push({ inlineData: { mimeType: mime, data: base64 } })
        }
      }
    }
    parts.push({ text: msg.content })
    messages.push({ role, parts })
  }
  return messages
}

export async function sendChatMessage(
  history: ChatEntry[],
  conditions: EffectiveConditions,
  isDiagnostic: boolean,
  tone: ChatTone = 'casual',
): Promise<{ content: string; suggestions: string[] }> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API key no configurada')

  const systemPrompt = isDiagnostic ? getDiagnosticPrompt() : chatSystemPrompt(tone)
  const contents = buildContents(history, conditions, isDiagnostic)

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  }

  let lastError: unknown = null

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data?.error?.message ?? `Error ${res.status}`
        if (res.status === 404 || res.status === 429) {
          lastError = message
          continue
        }
        throw new Error(message)
      }
      const parts = data?.candidates?.[0]?.content?.parts
      const text = Array.isArray(parts) ? parts.find((p: { text?: string }) => typeof p.text === 'string')?.text : parts?.[0]?.text
      if (typeof text !== 'string' || !text.trim()) {
        lastError = new Error(isDiagnostic ? 'Empty response' : 'El modelo devolvió una respuesta vacía')
        continue
      }
      const fullText = text.trim()
      const suggestions = parseSuggestedQuestions(fullText)
      const content = stripSuggestedQuestions(fullText)
      return { content, suggestions }
    } catch (err) {
      lastError = err
    }
  }

  if (lastError instanceof TypeError && lastError.message === 'Failed to fetch') {
    const isEn = getCurrentLanguage() === 'en'
    throw new Error(isEn ? 'No internet connection. The AI skipper needs to be online.' : 'Sin conexión a internet. El patrón IA necesita estar en línea para responder.')
  }
  const isEn = getCurrentLanguage() === 'en'
  throw lastError instanceof Error
    ? lastError
    : new Error(isEn ? 'All Gemini models are busy. Try again in a few seconds.' : 'Todos los modelos Gemini están ocupados. Reintenta en unos segundos.')
}
