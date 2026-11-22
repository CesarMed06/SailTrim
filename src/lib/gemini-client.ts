import i18n, { getCurrentLanguage } from '../i18n'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_TIMEOUT_MS = 25_000
const RETRY_DELAY_MS = 1_500

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
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]
  error?: { message?: string }
}

interface GenerateContentOptions {
  apiKey: string
  body: unknown
  timeoutMs?: number
  retryDelayMs?: number
}

function extractText(payload: GeminiPayload): string {
  const parts = payload.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  const text = parts.find((part) => typeof part.text === 'string')?.text ?? ''
  return text.trim()
}

function requestModel(model: string, apiKey: string, body: unknown, timeoutMs: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  return (async () => {
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

      if (response.status === 404) throw new GeminiError('unknown')
      if (response.status === 429) throw new GeminiError('rateLimit')
      if (response.status >= 500) throw new GeminiError('server')
      if (!response.ok) {
        const detail = payload.error?.message ?? ''
        if (response.status === 401 || response.status === 403 || (response.status === 400 && /api key/i.test(detail))) {
          throw new GeminiError('auth')
        }
        throw new GeminiError('unknown')
      }

      const text = extractText(payload)
      if (!text) throw new GeminiError('empty')
      return text
    } catch (error) {
      if (error instanceof GeminiError) throw error
      if (error instanceof Error && error.name === 'AbortError') throw new GeminiError('timeout')
      throw new GeminiError('network')
    } finally {
      clearTimeout(timer)
    }
  })()
}

async function tryModels(apiKey: string, body: unknown, timeoutMs: number): Promise<string> {
  let lastError: GeminiError = new GeminiError('unknown')

  for (const model of GEMINI_MODELS) {
    try {
      return await requestModel(model, apiKey, body, timeoutMs)
    } catch (error) {
      if (!(error instanceof GeminiError) || error.code === 'auth' || error.code === 'network') {
        throw error
      }
      lastError = error
    }
  }

  throw lastError
}

async function streamModel(
  model: string,
  apiKey: string,
  body: unknown,
  idleTimeoutMs: number,
  onText: (text: string) => void,
): Promise<string> {
  const controller = new AbortController()
  let timer = setTimeout(() => controller.abort(), idleTimeoutMs)
  const resetTimer = () => {
    clearTimeout(timer)
    timer = setTimeout(() => controller.abort(), idleTimeoutMs)
  }

  try {
    const response = await fetch(`${ENDPOINT}/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (response.status === 404) throw new GeminiError('unknown')
    if (response.status === 429) throw new GeminiError('rateLimit')
    if (response.status >= 500) throw new GeminiError('server')
    if (!response.ok) {
      const detail = (await response.json().catch(() => ({})) as GeminiPayload).error?.message ?? ''
      if (response.status === 401 || response.status === 403 || (response.status === 400 && /api key/i.test(detail))) {
        throw new GeminiError('auth')
      }
      throw new GeminiError('unknown')
    }

    const reader = response.body?.getReader()
    if (!reader) throw new GeminiError('empty')

    const decoder = new TextDecoder()
    let buffer = ''
    let text = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      resetTimer()
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (!data) continue
        try {
          const payload = JSON.parse(data) as GeminiPayload
          const parts = payload.candidates?.[0]?.content?.parts ?? []
          for (const part of parts) {
            if (part.thought || !part.text) continue
            text += part.text
            onText(text)
          }
        } catch {
          continue
        }
      }
    }

    if (!text.trim()) throw new GeminiError('empty')
    return text
  } catch (error) {
    if (error instanceof GeminiError) throw error
    if (error instanceof Error && error.name === 'AbortError') throw new GeminiError('timeout')
    throw new GeminiError('network')
  } finally {
    clearTimeout(timer)
  }
}

export async function generateContentStream({
  apiKey,
  body,
  timeoutMs = 20_000,
  retryDelayMs = RETRY_DELAY_MS,
  onText,
}: GenerateContentOptions & { onText: (text: string) => void }): Promise<string> {
  if (!apiKey.trim()) throw new GeminiError('auth')

  let lastError: GeminiError = new GeminiError('unknown')
  let emitted = false
  const emit = (text: string) => {
    emitted = true
    onText(text)
  }

  for (let pass = 0; pass < 2; pass += 1) {
    for (const model of GEMINI_MODELS) {
      try {
        return await streamModel(model, apiKey, body, timeoutMs, emit)
      } catch (error) {
        if (!(error instanceof GeminiError) || error.code === 'auth' || error.code === 'network' || emitted) throw error
        lastError = error
      }
    }

    const retryable = lastError.code === 'rateLimit' || lastError.code === 'server' || lastError.code === 'empty'
    if (pass === 0 && retryable) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
      continue
    }
    throw lastError
  }

  throw lastError
}

export async function generateContent({
  apiKey,
  body,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retryDelayMs = RETRY_DELAY_MS,
}: GenerateContentOptions): Promise<string> {
  if (!apiKey.trim()) throw new GeminiError('auth')

  try {
    return await tryModels(apiKey, body, timeoutMs)
  } catch (error) {
    const retryable = error instanceof GeminiError && (error.code === 'rateLimit' || error.code === 'server' || error.code === 'empty')
    if (!retryable) throw error
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    return tryModels(apiKey, body, timeoutMs)
  }
}
