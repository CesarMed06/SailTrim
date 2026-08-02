import type { BeaufortForce, BoatType, ExperienceLevel, TrimConditions, WindAngle } from '../types'
import { BEAUFORT_SCALE, BOAT_TYPES, EXPERIENCE_LEVELS, GEMINI_API_KEY_STORAGE, WIND_ANGLE_LABELS } from './constants'
import type { LiveWind, TrimMode } from '../context/TrimContext'
import { toWindAngle } from './wind-utils'

export interface EffectiveConditions {
  angle: WindAngle
  force: BeaufortForce
  speedKnots: number | null
  boatType: BoatType
  experience: ExperienceLevel
  seaState?: 'calm' | 'moderate' | 'rough'
  mode: TrimMode
}

export function getEffectiveConditions(
  conditions: TrimConditions,
  mode: TrimMode,
  liveWind: LiveWind | null,
): EffectiveConditions {
  if (mode !== 'manual' && liveWind) {
    return {
      angle: toWindAngle(liveWind.direction),
      force: liveWind.force,
      speedKnots: liveWind.speedKnots,
      boatType: conditions.boatType,
      experience: conditions.experience,
      seaState: conditions.seaState,
      mode,
    }
  }
  return {
    angle: conditions.windAngle,
    force: conditions.windForce,
    speedKnots: null,
    boatType: conditions.boatType,
    experience: conditions.experience,
    seaState: conditions.seaState,
    mode,
  }
}

export function getApiKey(): string {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) ?? ''
}

export function saveApiKey(key: string) {
  localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim())
}

export function clearApiKey() {
  localStorage.removeItem(GEMINI_API_KEY_STORAGE)
}

function describeConditions(c: EffectiveConditions): string {
  const boat = BOAT_TYPES.find((b) => b.value === c.boatType)?.label ?? c.boatType
  const exp = EXPERIENCE_LEVELS.find((e) => e.value === c.experience)?.label ?? c.experience
  const beaufort = BEAUFORT_SCALE[c.force]
  const angle = WIND_ANGLE_LABELS[c.angle]?.full ?? `${c.angle}°`
  const sea =
    c.seaState === 'calm'
      ? 'mar en calma'
      : c.seaState === 'moderate'
        ? 'mar moderada'
        : c.seaState === 'rough'
          ? 'mar gruesa'
          : 'no especificado'
  const wind = c.speedKnots !== null ? `${c.speedKnots.toFixed(1)} nudos` : beaufort.windSpeed
  const source =
    c.mode === 'manual'
      ? 'configuración manual'
      : c.mode === 'demo'
        ? 'simulación en tiempo real'
        : 'datos reales del barco (NMEA/SignalK)'
  return [
    `- Embarcación: ${boat}`,
    `- Rumbo respecto al viento: ${c.angle}° (${angle})`,
    `- Viento: ${wind} (fuerza ${c.force} Beaufort, "${beaufort.label}")`,
    `- Estado del mar: ${sea}`,
    `- Nivel del navegante: ${exp}`,
    `- Origen de los datos: ${source}`,
  ].join('\n')
}

function fixSpanishCaps(text: string): string {
  return text.replace(/(: )(\*\*)?([A-ZÁÉÍÓÚÑ])(?=[a-záéíóúñ])/g, (_match, space, bold, letter) =>
    `${space}${bold ?? ''}${letter.toLowerCase()}`,
  )
}

export function buildTrimPrompt(c: EffectiveConditions): string {
  return `Datos actuales de navegación:
${describeConditions(c)}

Con estos datos, dame el plan de trimado completo.`
}

const SYSTEM_PROMPT = `Eres un instructor de vela oceánica con 30 años de experiencia en regatas y cruceros. Hablas con terminología marinera real en español: ceñida, través, descuartelar, aleta, empopada, mayor, foque, genoa, escota, traveller, cunningham, pajarín, rizos, backstay, obenques, carro de escota, enrollador. Conoces cada tipo de embarcación (monocasco, catamarán, trimarán, crucero, regata, vela ligera) y cómo se comporta en cada fuerza de viento.

Da consejos prácticos, seguros y adaptados al nivel del navegante:
- Principiante: pasos sencillos y numerados, explicando cada término brevemente.
- Intermedio: ajustes concretos con nombres técnicos.
- Avanzado: ajustes finos de alto rendimiento (curvatura de mástil, tensión de jarcia, etc.).

Reglas de estilo:
- No te presentes ni saludes. No digas cuántos años de experiencia tienes, ni uses frases como "hola patrón", "ahoy" o "como instructor con 30 años". Empieza directamente con la sección 📋 Resumen.
- Sé directo y conciso. Máximo 400 palabras.
- No uses asteriscos sueltos ni cursiva: solo negrita (**texto**) para lo importante.
- Escribe en minúscula la primera palabra después de dos puntos (:), salvo nombres propios.

Responde SIEMPRE en español con markdown y esta estructura exacta de secciones (usa los mismos títulos):
## 📋 Resumen
Un párrafo que diagnostique la situación.
## ⛵ Vela mayor
Consejos de trimado de la vela mayor.
## 🔺 Foque / Genoa
Consejos de trimado del foque o genoa.
## 🏗️ Mástil y jarcia
Ajustes de mástil, backstay y obenques si aplican.
## 👥 Tripulación
Qué debe hacer cada tripulante, posición del peso, trapecio si aplica.
## ⚠️ Seguridad
Notas de seguridad específicas para estas condiciones.

Usa listas con guiones y negrita para lo importante.`

const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']

export async function analyzeTrim(c: EffectiveConditions, apiKey: string): Promise<string> {
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: buildTrimPrompt(c) }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
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
      return fixSpanishCaps(text.trim())
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No se pudo contactar con la API de Gemini')
}
