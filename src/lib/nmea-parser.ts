import { knotsToBeaufort, toWindAngle } from './wind-utils'
import type { ParsedWind, NmeaFeedLine } from '../types'

function nmeaChecksum(sentence: string): boolean {
  const starIdx = sentence.lastIndexOf('*')
  if (starIdx === -1) return true

  const expected = sentence.slice(starIdx + 1).trim()
  let checksum = 0
  for (let i = 1; i < starIdx; i++) {
    checksum ^= sentence.charCodeAt(i)
  }
  const computed = checksum.toString(16).toUpperCase().padStart(2, '0')
  return computed === expected
}

export function parseNmeaSentence(sentence: string): ParsedWind | null {
  const trimmed = sentence.trim()
  if (!trimmed.startsWith('$')) return null
  if (!nmeaChecksum(trimmed)) return null

  const body = trimmed.includes('*') ? trimmed.slice(0, trimmed.lastIndexOf('*')) : trimmed
  const fields = body.split(',')

  const talker = fields[0]

  if (talker === '$WIMWV' || talker === '$IIMWV' || talker === '$SIMWV') {
    if (fields.length < 6) return null

    const angle = parseFloat(fields[1])
    const reference = fields[2]
    const speed = parseFloat(fields[3])
    const units = fields[4]

    if (isNaN(angle) || isNaN(speed)) return null

    let speedKn = speed
    if (units === 'K') speedKn = speed * 1.852

    return {
      direction: Math.round(angle),
      speedKnots: Math.round(speedKn * 10) / 10,
      force: knotsToBeaufort(speedKn),
      windAngle: toWindAngle(angle),
      isTrue: reference === 'T',
      rawSentence: trimmed,
    }
  }

  if (talker === '$WIVWT' || talker === '$IIVWT') {
    if (fields.length < 6) return null

    const angle = parseFloat(fields[1])
    const speed = parseFloat(fields[3])
    const units = fields[4]

    if (isNaN(angle) || isNaN(speed)) return null

    let speedKn = speed
    if (units === 'K') speedKn = speed * 1.852

    return {
      direction: Math.round(angle),
      speedKnots: Math.round(speedKn * 10) / 10,
      force: knotsToBeaufort(speedKn),
      windAngle: toWindAngle(angle),
      isTrue: true,
      rawSentence: trimmed,
    }
  }

  return null
}

export function parseSignalKDelta(msg: string): ParsedWind | null {
  try {
    const data = JSON.parse(msg)
    const updates = data?.updates
    if (!Array.isArray(updates)) return null

    for (const update of updates) {
      const values = update?.values
      if (!Array.isArray(values)) continue

      let directionDeg: number | null = null
      let speedMs: number | null = null

      for (const v of values) {
        if (
          v.path === 'environment.wind.directionTrue' ||
          v.path === 'environment.wind.directionApparent'
        ) {
          directionDeg = Number(v.value)
        }
        if (
          v.path === 'environment.wind.speedTrue' ||
          v.path === 'environment.wind.speedApparent' ||
          v.path === 'environment.wind.speedOverGround'
        ) {
          if (speedMs === null) speedMs = Number(v.value)
        }
      }

      if (directionDeg !== null && speedMs !== null) {
        const speedKn = speedMs * 1.94384
        return {
          direction: Math.round(directionDeg * 10) / 10,
          speedKnots: Math.round(speedKn * 10) / 10,
          force: knotsToBeaufort(speedKn),
          windAngle: toWindAngle(Math.round(directionDeg)),
          isTrue: true,
          rawSentence: msg.slice(0, 200),
        }
      }
    }
  } catch {
    return null
  }

  return null
}

function computeNmeaChecksum(sentence: string): string {
  let checksum = 0
  for (let i = 1; i < sentence.length; i++) {
    checksum ^= sentence.charCodeAt(i)
  }
  return checksum.toString(16).toUpperCase().padStart(2, '0')
}

export function generateFakeNmeaSentence(): string {
  const direction = Math.floor(Math.random() * 181)
  const speed = (5 + Math.random() * 20).toFixed(1)
  const ref = Math.random() > 0.3 ? 'R' : 'T'
  const body = `$WIMWV,${String(direction).padStart(3, '0')},${ref},${speed},N,A`
  return `${body}*${computeNmeaChecksum(body)}`
}

export function generateFakeSignalKDelta(): string {
  const directionRad = (Math.random() * Math.PI).toFixed(4)
  const speedMs = (2 + Math.random() * 10).toFixed(2)
  return JSON.stringify({
    updates: [
      {
        values: [
          { path: 'environment.wind.directionTrue', value: parseFloat(directionRad) },
          { path: 'environment.wind.speedTrue', value: parseFloat(speedMs) },
        ],
      },
    ],
  })
}

export function processFeedBuffer(
  rawData: string,
  existingLines: NmeaFeedLine[]
): {
  lines: NmeaFeedLine[]
  latestWind: ParsedWind | null
} {
  const now = Date.now()
  const newLines = rawData.split('\n').filter((l) => l.trim())
  let latestWind: ParsedWind | null = null

  const allLines = [...existingLines]

  for (const raw of newLines) {
    const trimmed = raw.trim()

    if (trimmed.startsWith('{')) {
      const parsed = parseSignalKDelta(trimmed)
      allLines.push({
        timestamp: now,
        raw: trimmed,
        parsed,
        error: null,
      })
      if (parsed) latestWind = parsed
      continue
    }

    if (trimmed.startsWith('$')) {
      const parsed = parseNmeaSentence(trimmed)
      allLines.push({
        timestamp: now,
        raw: trimmed,
        parsed,
        error: parsed ? null : 'Frase no soportada',
      })
      if (parsed) latestWind = parsed
      continue
    }
  }

  return { lines: allLines.slice(-200), latestWind }
}
