import i18n, { getCurrentLanguage } from '../i18n'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_TIMEOUT_MS = 45_000

export const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'] as const

export type GeminiErrorCode = 'auth' | 'rateLimit' | 'timeout' | 'network' | 'empty' | 'server' | 'unknown'

export class GeminiError extends Error {
  readonly code: GeminiErrorCode

  constructor(code: GeminiErrorCode) {
    super(String(i18n.t(`aiErrors.${code}`, { lng: getCurrentLanguage() })))
    this.name = 'GeminiError'
    this.code = code
  }
}

interface GeminiPayload {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
  error?: { message?: string }
}

interface GenerateContentOptions {
  apiKey: string
  body: unknown
  timeoutMs?: number
}

function extractText(payload: GeminiPayload): string {
  const parts = payload.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  const text = parts.find((part) => typeof part.text === 'string')?.text ?? ''
  return text.trim()
}

export async function generateContent({
  apiKey,
  body,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: GenerateContentOptions): Promise<string> {
  if (!apiKey.trim()) throw new GeminiError('auth')

  let lastError: GeminiError = new GeminiError('unknown')
  let rateLimited = false
  let serverFailed = false

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      const payload = (await response.json().catch(() => ({}))) as GeminiPayload

      if (response.status === 404) {
        lastError = new GeminiError('unknown')
        continue
      }
      if (response.status === 429) {
        rateLimited = true
        lastError = new GeminiError('rateLimit')
        continue
      }
      if (response.status >= 500) {
        serverFailed = true
        lastError = new GeminiError('server')
        continue
      }
      if (!response.ok) {
        const detail = payload.error?.message ?? ''
        if (response.status === 401 || response.status === 403 || (response.status === 400 && /api key/i.test(detail))) {
          throw new GeminiError('auth')
        }
        throw new GeminiError('unknown')
      }

      const text = extractText(payload)
      if (!text) {
        lastError = new GeminiError('empty')
        continue
      }
      return text
    } catch (error) {
      if (error instanceof GeminiError) throw error
      if (error instanceof Error && error.name === 'AbortError') throw new GeminiError('timeout')
      throw new GeminiError('network')
    } finally {
      clearTimeout(timer)
    }
  }

  if (rateLimited) throw new GeminiError('rateLimit')
  if (serverFailed) throw new GeminiError('server')
  throw lastError
}
