import { describe, expect, it } from 'vitest'
import { buildHistoryMessages, HISTORY_WINDOW, IMAGES_WINDOW, type ChatEntry } from '../chat'

const user = (content: string, images?: string[]): ChatEntry => ({ role: 'user', content, images })
const bot = (content: string): ChatEntry => ({ role: 'assistant', content })
const photo = (n: number) => `data:image/jpeg;base64,PHOTO${n}`

describe('buildHistoryMessages', () => {
  it('keeps short conversations intact', () => {
    expect(buildHistoryMessages([user('hola'), bot('respuesta'), user('gracias')])).toHaveLength(3)
  })

  it('only sends the most recent turns of a long conversation', () => {
    const history: ChatEntry[] = []
    for (let i = 0; i < 30; i += 1) {
      history.push(i % 2 === 0 ? user(`pregunta ${i}`) : bot(`respuesta ${i}`))
    }
    const messages = buildHistoryMessages(history)
    expect(messages).toHaveLength(HISTORY_WINDOW)
    expect(messages[0]?.role).toBe('user')
    expect(messages.at(-1)?.parts[0]).toEqual({ text: 'respuesta 29' })
  })

  it('drops the images of all but the latest photo messages', () => {
    const history = [
      user('foto 1', [photo(1)]),
      bot('ok'),
      user('foto 2', [photo(2)]),
      bot('ok'),
      user('foto 3', [photo(3)]),
      bot('ok'),
      user('foto 4', [photo(4)]),
    ]
    const messages = buildHistoryMessages(history)
    const withImages = messages.filter((m) => m.parts.some((p) => 'inlineData' in p))
    expect(withImages).toHaveLength(IMAGES_WINDOW)
    expect(messages.at(-1)?.parts.filter((p) => 'inlineData' in p)).toHaveLength(1)
  })
})
