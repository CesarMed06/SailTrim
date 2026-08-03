import { getApiKey } from './gemini'
import type { EffectiveConditions } from './gemini'
import { BEAUFORT_SCALE, BOAT_TYPES, EXPERIENCE_LEVELS, WIND_ANGLE_LABELS } from './constants'

const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']

export interface ChatEntry {
  role: 'user' | 'assistant'
  content: string
}

export type ChatTone = 'casual' | 'formal' | 'tecnico' | 'principiante'

export const TONE_LABELS: Record<ChatTone, string> = {
  casual: '🎙️ Casual',
  formal: '📻 Radio VHF',
  tecnico: '🔧 Técnico',
  principiante: '🧑‍🎓 Paciente',
}

function describeConditionsBrief(c: EffectiveConditions): string {
  const boat = BOAT_TYPES.find((b) => b.value === c.boatType)?.label ?? c.boatType
  const exp = EXPERIENCE_LEVELS.find((e) => e.value === c.experience)?.label ?? c.experience
  const beaufort = BEAUFORT_SCALE[c.force]
  const angle = WIND_ANGLE_LABELS[c.angle]?.short ?? `${c.angle}°`
  const wind = c.speedKnots !== null ? `${c.speedKnots.toFixed(1)} nudos` : beaufort.windSpeed
  const source =
    c.mode === 'manual'
      ? 'configuración manual'
      : c.mode === 'demo'
        ? 'simulación en tiempo real'
        : 'datos reales del barco (NMEA/SignalK)'
  return [
    `Embarcación: ${boat}`,
    `Rumbo: ${c.angle}° (${angle})`,
    `Viento: ${wind}, fuerza ${c.force} (${beaufort.label})`,
    `Nivel: ${exp}`,
    `Origen: ${source}`,
  ].join(' | ')
}

function chatSystemPrompt(tone: ChatTone): string {
  const base = `Eres un instructor de vela oceánica con décadas de experiencia. Hablas en español con terminología marinera real: ceñida, través, descuartelar, aleta, empopada, mayor, foque, escota, traveller, cunningham, pajarín, rizos, backstay, carro de escota.

Reglas:
- No te presentes ni saludes. No digas tu experiencia ni uses frases como "hola", "ahoy", "soy un instructor con X años". Empieza directo.
- Sé conciso y directo.
- Usa negrita (**texto**) para los términos importantes.
- No uses cursiva ni asteriscos sueltos.
- Escribe en minúscula tras dos puntos (:), salvo nombres propios.
- Al final de tu respuesta, añade la sección ## 💭 Preguntas con 2-3 sugerencias de continuación en formato lista. No uses listas numeradas en las preguntas sugeridas.
- Si usas una lista numerada en tu respuesta, escribe cada paso así: "1. texto" (número, punto, espacio, texto en la MISMA línea, nunca con saltos de línea entre el número y el texto).`

  const tones: Record<ChatTone, string> = {
    casual: 'Responde con naturalidad, como un patrón experimentado hablando con su tripulación por radio VHF. Usa expresiones coloquiales de la mar.',
    formal: 'Responde con formalidad náutica, como un capitán dirigiéndose a su oficial. Lenguaje correcto y preciso.',
    tecnico: 'Responde con máxima precisión técnica. Usa ángulos exactos, nombres de cabos específicos y detalles de regata de alto nivel. Para navegantes avanzados.',
    principiante: 'Responde como un instructor paciente con un grumete. Explica cada término náutico entre paréntesis. Usa analogías sencillas y pasos muy claros. Para quien acaba de empezar.',
  }

  return `${base}
${tones[tone]}`
}

const DIAGNOSTIC_SYSTEM_PROMPT = `Eres un instructor de vela experto en diagnosticar problemas de trimado. Hablas en español con terminología marinera real.

Tu tarea: el navegante te describe un síntoma ("el barco escora mucho", "no puedo ceñir", "la mayor flamea") y tú diagnosticas la causa más probable y das la solución concreta.

Reglas:
- No te presentes ni saludes. Empieza directo con el diagnóstico.
- Sé conciso y directo.
- Usa negrita (**texto**) para los términos importantes.
- No uses cursiva ni asteriscos sueltos.
- Estructura tu respuesta: primero el diagnóstico (qué está pasando), luego la solución (qué hacer).
- Al final, añade la sección ## 💭 Preguntas con 1-2 sugerencias de continuación.`

export function parseSuggestedQuestions(content: string): string[] {
  const marker = '## 💭 Preguntas'
  const idx = content.indexOf(marker)
  if (idx === -1) return []
  const section = content.slice(idx + marker.length)
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
  const idx = content.indexOf(marker)
  if (idx === -1) return content
  return content.slice(0, idx).trimEnd()
}

function buildContents(
  history: ChatEntry[],
  conditions: EffectiveConditions,
  isDiagnostic: boolean,
): { role: string; parts: { text: string }[] }[] {
  const prefix = isDiagnostic
    ? 'Modo diagnóstico. El navegante describe un síntoma y espera que averigües qué falla y cómo arreglarlo. Condiciones actuales:'
    : 'Condiciones actuales del barco:'
  const contextLine = `${prefix} ${describeConditionsBrief(conditions)}.`
  const systemNote = {
    role: 'user' as const,
    parts: [{ text: contextLine }],
  }
  const response = { role: 'model' as const, parts: [{ text: 'Entendido.' }] }
  const messages: { role: string; parts: { text: string }[] }[] = [systemNote, response]
  for (const msg of history) {
    const role = msg.role === 'user' ? 'user' : 'model'
    messages.push({ role, parts: [{ text: msg.content }] })
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

  const systemPrompt = isDiagnostic ? DIAGNOSTIC_SYSTEM_PROMPT : chatSystemPrompt(tone)
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
        if (res.status === 404) {
          lastError = message
          continue
        }
        throw new Error(message)
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (typeof text !== 'string' || !text.trim()) throw new Error('El modelo devolvió una respuesta vacía')
      const fullText = text.trim()
      const suggestions = parseSuggestedQuestions(fullText)
      const content = stripSuggestedQuestions(fullText)
      return { content, suggestions }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No se pudo contactar con la API de Gemini')
}
