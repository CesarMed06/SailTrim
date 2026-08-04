import { getGlossaryMap, type GlossaryEntry } from '../data/glossary'

const glossaryMap = getGlossaryMap()

export const WORD_REGEX = /\b([áéíóúñüa-zA-ZÁÉÍÓÚÑÜ]+)\b/g

const MIN_TERM_LENGTH = 3
const EXCLUDED_WORDS = new Set([
  'para', 'como', 'más', 'con', 'por', 'del', 'los', 'las', 'una', 'que',
  'sus', 'sin', 'son', 'era', 'vez', 'muy', 'hay', 'tan', 'así',
  'mayor', 'otro', 'otra', 'todo', 'cada', 'este', 'esta',
])

export function findTerm(word: string): GlossaryEntry | undefined {
  if (word.length < MIN_TERM_LENGTH) return undefined
  if (EXCLUDED_WORDS.has(word.toLowerCase())) return undefined
  const lower = word.toLowerCase()
  const match = glossaryMap.get(lower)
  if (match) return match
  if (lower.endsWith('s')) {
    const singular = lower.slice(0, -1)
    const sMatch = glossaryMap.get(singular)
    if (sMatch && !EXCLUDED_WORDS.has(singular)) return sMatch
  }
  if (lower.endsWith('es')) {
    const radical = lower.slice(0, -2)
    const eMatch = glossaryMap.get(radical) || glossaryMap.get(radical + 'a') || glossaryMap.get(radical + 'o')
    if (eMatch && !EXCLUDED_WORDS.has(radical)) return eMatch
  }
  return undefined
}

export function detectTermsInText(text: string): { word: string; entry: GlossaryEntry; index: number }[] {
  const results: { word: string; entry: GlossaryEntry; index: number }[] = []
  const regex = new RegExp(WORD_REGEX.source, WORD_REGEX.flags)
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const word = match[1]
    const entry = findTerm(word)
    if (entry) {
      results.push({ word, entry, index: match.index })
    }
  }
  return results
}

export function findTermsInLine(text: string): GlossaryEntry[] {
  return detectTermsInText(text).map((r) => r.entry)
}
