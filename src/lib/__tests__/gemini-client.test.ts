import { afterEach, describe, expect, it, vi } from 'vitest'
import { GEMINI_MODELS, GeminiError, generateContent, generateContentStream } from '../gemini-client'

const realFetch = globalThis.fetch

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function answer(text: string): Response {
  return jsonResponse(200, { candidates: [{ content: { parts: [{ text }] } }] })
}

function useFetch(mock: ReturnType<typeof vi.fn>) {
  globalThis.fetch = mock as unknown as typeof fetch
  return mock
}

afterEach(() => {
  globalThis.fetch = realFetch
  vi.restoreAllMocks()
})

function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder()
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return { ok: true, status: 200, body } as unknown as Response
}

describe('generateContentStream', () => {
  it('delivers each chunk as it arrives and returns the full text', async () => {
    useFetch(
      vi.fn().mockResolvedValue(
        sseResponse([
          'data: {"candidates":[{"content":{"parts":[{"text":"Hola "}]}}]}\n\n',
          'data: {"candidates":[{"content":{"parts":[{"text":"mundo"}]}}]}\n\n',
        ]),
      ),
    )

    const seen: string[] = []
    const text = await generateContentStream({ apiKey: 'k', body: {}, onText: (t) => seen.push(t) })

    expect(text).toBe('Hola mundo')
    expect(seen).toEqual(['Hola ', 'Hola mundo'])
  })

  it('ignores thinking parts', async () => {
    useFetch(
      vi.fn().mockResolvedValue(
        sseResponse([
          'data: {"candidates":[{"content":{"parts":[{"text":"pensando","thought":true}]}}]}\n\n',
          'data: {"candidates":[{"content":{"parts":[{"text":"Veleta"}]}}]}\n\n',
        ]),
      ),
    )

    const seen: string[] = []
    await expect(generateContentStream({ apiKey: 'k', body: {}, onText: (t) => seen.push(t) })).resolves.toBe('Veleta')
    expect(seen).toEqual(['Veleta'])
  })

  it('falls back to the next model when the stream fails before any text', async () => {
    useFetch(
      vi.fn()
        .mockResolvedValueOnce(jsonResponse(429, {}))
        .mockResolvedValueOnce(sseResponse(['data: {"candidates":[{"content":{"parts":[{"text":"ok"}]}}]}\n\n'])),
    )

    await expect(generateContentStream({ apiKey: 'k', body: {}, onText: () => {} })).resolves.toBe('ok')
  })
})

describe('generateContent', () => {
  it('sends the key in the x-goog-api-key header and never in the URL', async () => {
    const mock = useFetch(vi.fn().mockResolvedValue(answer('plan')))

    await expect(generateContent({ apiKey: 'AIza-test', body: {} })).resolves.toBe('plan')

    const [url, init] = mock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS[0]}:generateContent`)
    expect(url).not.toContain('key=')
    expect(init.headers).toMatchObject({ 'x-goog-api-key': 'AIza-test' })
  })

  it('falls back to the next model when a model is missing', async () => {
    const mock = useFetch(
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(404, { error: { message: 'not found' } }))
        .mockResolvedValueOnce(answer('fallback')),
    )

    await expect(generateContent({ apiKey: 'k', body: {} })).resolves.toBe('fallback')
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('falls back when a model returns no text', async () => {
    useFetch(
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, { candidates: [{ content: { parts: [] } }] }))
        .mockResolvedValueOnce(answer('second')),
    )

    await expect(generateContent({ apiKey: 'k', body: {} })).resolves.toBe('second')
  })

  it('stops on an authentication error instead of trying every model', async () => {
    const mock = useFetch(vi.fn().mockResolvedValue(jsonResponse(403, {})))

    await expect(generateContent({ apiKey: 'k', body: {} })).rejects.toMatchObject({ code: 'auth' })
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('rejects an empty key before making any request', async () => {
    const mock = useFetch(vi.fn())

    await expect(generateContent({ apiKey: '   ', body: {} })).rejects.toBeInstanceOf(GeminiError)
    expect(mock).not.toHaveBeenCalled()
  })

  it('retries once after a transient rate limit', async () => {
    const mock = useFetch(
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(429, {}))
        .mockResolvedValueOnce(jsonResponse(429, {}))
        .mockResolvedValueOnce(jsonResponse(429, {}))
        .mockResolvedValue(answer('second chance')),
    )

    await expect(generateContent({ apiKey: 'k', body: {}, retryDelayMs: 0 })).resolves.toBe('second chance')
    expect(mock).toHaveBeenCalledTimes(GEMINI_MODELS.length + 1)
  })

  it('reports a rate limit once every model is exhausted twice', async () => {
    const mock = useFetch(vi.fn().mockResolvedValue(jsonResponse(429, {})))

    await expect(generateContent({ apiKey: 'k', body: {}, retryDelayMs: 0 })).rejects.toMatchObject({ code: 'rateLimit' })
    expect(mock).toHaveBeenCalledTimes(GEMINI_MODELS.length * 2)
  })

  it('does not retry an authentication failure', async () => {
    const mock = useFetch(vi.fn().mockResolvedValue(jsonResponse(403, {})))

    await expect(generateContent({ apiKey: 'k', body: {}, retryDelayMs: 0 })).rejects.toMatchObject({ code: 'auth' })
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('reports a network failure when fetch rejects', async () => {
    useFetch(vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(generateContent({ apiKey: 'k', body: {} })).rejects.toMatchObject({ code: 'network' })
  })

  it('falls back to the next model when a model times out', async () => {
    const mock = useFetch(
      vi
        .fn()
        .mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }))
        .mockResolvedValueOnce(answer('faster model')),
    )

    await expect(generateContent({ apiKey: 'k', body: {} })).resolves.toBe('faster model')
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('maps an aborted request to a timeout', async () => {
    useFetch(vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' })))

    await expect(generateContent({ apiKey: 'k', body: {} })).rejects.toMatchObject({ code: 'timeout' })
  })
})
