import type { BeaufortForce, BoatType, ExperienceLevel, TrimConditions, WindAngle } from '../types'
import { GEMINI_API_KEY_STORAGE } from './constants'
import type { LiveWind, TrimMode } from '../context/TrimContext'
import { toWindAngle } from './wind-utils'
import i18n, { getCurrentLanguage } from '../i18n'

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
  const lang = getCurrentLanguage()
  const isEn = lang === 'en'

  const boatKey = `boatTypes.${c.boatType}`
  const boat = i18n.t(boatKey, { lng: lang })
  const expKey = `experience.${c.experience}`
  const exp = i18n.t(expKey, { lng: lang })
  const beaufort = i18n.t(`beaufort.${c.force}`, { lng: lang, returnObjects: true }) as { label: string; description: string; windSpeed: string; seaState: string }
  const windAngleData = i18n.t(`windAngles.${c.angle}`, { lng: lang, returnObjects: true }) as { short: string; full: string }
  const angle = windAngleData?.full ?? `${c.angle}°`
  const sea =
    c.seaState === 'calm'
      ? i18n.t('seaState.calm', { lng: lang })
      : c.seaState === 'moderate'
        ? i18n.t('seaState.moderate', { lng: lang })
        : c.seaState === 'rough'
          ? i18n.t('seaState.rough', { lng: lang })
          : isEn ? 'not specified' : 'no especificado'
  const wind = c.speedKnots !== null ? `${c.speedKnots.toFixed(1)} ${isEn ? 'knots' : 'nudos'}` : (beaufort?.windSpeed || '')
  const source =
    c.mode === 'manual'
      ? isEn ? 'manual configuration' : 'configuración manual'
      : c.mode === 'demo'
        ? isEn ? 'real-time simulation' : 'simulación en tiempo real'
        : isEn ? 'real boat data (NMEA/SignalK)' : 'datos reales del barco (NMEA/SignalK)'
  return [
    isEn ? `- Boat: ${boat}` : `- Embarcación: ${boat}`,
    isEn ? `- Heading relative to wind: ${c.angle}° (${angle})` : `- Rumbo respecto al viento: ${c.angle}° (${angle})`,
    isEn ? `- Wind: ${wind} (force ${c.force} Beaufort, "${beaufort?.label || ''}")` : `- Viento: ${wind} (fuerza ${c.force} Beaufort, "${beaufort?.label || ''}")`,
    isEn ? `- Sea state: ${sea}` : `- Estado del mar: ${sea}`,
    isEn ? `- Sailor level: ${exp}` : `- Nivel del navegante: ${exp}`,
    isEn ? `- Data source: ${source}` : `- Origen de los datos: ${source}`,
  ].join('\n')
}

function fixSpanishCaps(text: string): string {
  return text.replace(/(: )(\*\*)?([A-ZÁÉÍÓÚÑ])(?=[a-záéíóúñ])/g, (_match, space, bold, letter) =>
    `${space}${bold ?? ''}${letter.toLowerCase()}`,
  )
}

export function buildTrimPrompt(c: EffectiveConditions): string {
  const lang = getCurrentLanguage()
  const isEn = lang === 'en'
  return isEn
    ? `Current navigation data:
${describeConditions(c)}

With this data, give me the complete trim plan.`
    : `Datos actuales de navegación:
${describeConditions(c)}

Con estos datos, dame el plan de trimado completo.`
}

function getSystemPrompt(): string {
  const lang = getCurrentLanguage()
  if (lang === 'en') {
    return `You are an ocean sailing instructor with decades of experience in regattas and cruising. You speak in real maritime terminology: close-hauled, beam reach, broad reach, running, mainsail, jib, genoa, sheet, traveller, cunningham, outhaul, reefs, backstay, fairleads, furler. You know every boat type (monohull, catamaran, trimaran, cruiser, racer, dinghy) and how it behaves in each wind force.

Give practical, safe advice tailored to the sailor's level:
- Beginner: simple numbered steps, briefly explaining each term.
- Intermediate: specific adjustments with technical names.
- Advanced: fine high-performance adjustments (mast bend, rigging tension, etc.).

Style rules:
- Do not introduce or greet. Do not mention your years of experience or use phrases like "hello skipper" or "ahoy". Start directly with the 📋 Summary section.
- Be direct and concise. Maximum 400 words.
- No loose asterisks or italics: only bold (**text**) for important items.
- Write in lowercase after colons (:), except proper nouns.

ALWAYS respond in English with markdown and this exact section structure (use the same headings):
## 📋 Summary
A paragraph diagnosing the situation.
## ⛵ Mainsail
Mainsail trim advice.
## 🔺 Jib / Genoa
Jib or genoa trim advice.
## 🏗️ Mast and rigging
Mast, backstay, and shroud adjustments if applicable.
## 👥 Crew
What each crew member should do, weight position, trapeze if applicable.
## ⚠️ Safety
Specific safety notes for these conditions.

Use dash lists and bold for important items.`
  }

  return `Eres un instructor de vela oceánica con 30 años de experiencia en regatas y cruceros. Hablas con terminología marinera real en español: ceñida, través, descuartelar, aleta, empopada, mayor, foque, genoa, escota, traveller, cunningham, pajarín, rizos, backstay, obenques, carro de escota, enrollador. Conoces cada tipo de embarcación (monocasco, catamarán, trimarán, crucero, regata, vela ligera) y cómo se comporta en cada fuerza de viento.

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
}

const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']

export async function analyzeTrim(c: EffectiveConditions, apiKey: string): Promise<string> {
  const body = {
    system_instruction: { parts: [{ text: getSystemPrompt() }] },
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
        if (res.status === 404 || res.status === 429) {
          lastError = message
          continue
        }
        throw new Error(message)
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (typeof text !== 'string' || !text.trim()) {
        lastError = new Error('El modelo devolvió una respuesta vacía')
        continue
      }
      return fixSpanishCaps(text.trim())
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Todos los modelos Gemini están ocupados. Reintenta en unos segundos.')
}
