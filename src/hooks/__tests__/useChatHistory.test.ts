import { describe, expect, it } from 'vitest'
import { MAX_CHATS, trimChats, type Conversation } from '../useChatHistory'

const chat = (id: string, updatedAt: number, pinned = false): Conversation => ({
  id,
  title: id,
  messages: [],
  tone: 'casual',
  diagnostic: false,
  createdAt: updatedAt,
  updatedAt,
  pinned,
})

describe('trimChats', () => {
  it('keeps every chat when under the limit', () => {
    expect(trimChats([chat('a', 1), chat('b', 2)])).toHaveLength(2)
  })

  it('keeps the newest chats and drops the oldest', () => {
    const chats = Array.from({ length: MAX_CHATS + 5 }, (_, i) => chat(`c${i}`, i))
    const kept = trimChats(chats).map((c) => c.id)
    expect(kept).toHaveLength(MAX_CHATS)
    expect(kept).not.toContain('c0')
    expect(kept).toContain(`c${MAX_CHATS + 4}`)
  })

  it('never drops a pinned chat', () => {
    const chats = [chat('old-pin', 0, true), ...Array.from({ length: MAX_CHATS }, (_, i) => chat(`c${i}`, i + 1))]
    expect(trimChats(chats).map((c) => c.id)).toContain('old-pin')
  })
})
