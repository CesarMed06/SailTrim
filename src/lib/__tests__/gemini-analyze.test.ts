import { afterEach, describe, expect, it, vi } from 'vitest'
import { analyzeTrimStream } from '../gemini'

const realFetch = globalThis.fetch

function sseResponse(chunks: string[], finish = 'STOP'): Response {
  const encoder = new TextEncoder()
  const events =
    finish && !chunks.some((chunk) => chunk.includes('finishReason'))
      ? [...chunks, `data: {"candidates":[{"finishReason":"${finish}"}]}

`]
      : chunks
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of events) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return { ok: true, status: 200, body } as unknown as Response
}

afterEach(() => {
  globalThis.fetch = realFetch
  vi.restoreAllMocks()
})

const conditions = {
  angle: 45,
  force: 3,
  speedKnots: 12,
  boatType: 'monohull',
  experience: 'intermediate',
  seaState: 3,
  mode: 'manual',
} as const

describe('analyzeTrimStream', () => {
  it('delivers the plan while it is written instead of waiting for the whole answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([
        'data: {"candidates":[{"content":{"parts":[{"text":"## Resumen"}]}}]}\n\n',
        'data: {"candidates":[{"content":{"parts":[{"text":" Caza el pajarín."}]}}]}\n\n',
      ]),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const seen: string[] = []
    const text = await analyzeTrimStream(conditions, 'k', (partial) => seen.push(partial))

    expect(seen).toEqual(['## Resumen', '## Resumen Caza el pajarín.'])
    expect(text).toBe('## Resumen Caza el pajarín.')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(':streamGenerateContent')
  })

  it('sends the current conditions and asks for the full plan', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse(['data: {"candidates":[{"content":{"parts":[{"text":"ok"}]}}]}\n\n']),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await analyzeTrimStream(conditions, 'k', () => {})

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const body = JSON.parse(String(init?.body)) as { contents: { parts: { text: string }[] }[] }
    const prompt = body.contents[0]?.parts[0]?.text ?? ''

    expect(prompt).toContain('45°')
    expect(prompt).toMatch(/trim/i)
  })
})
