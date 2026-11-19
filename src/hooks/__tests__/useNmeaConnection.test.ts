import { describe, it, expect } from 'vitest'
import { isSupportedNmeaUrl } from '../useNmeaConnection'

describe('isSupportedNmeaUrl', () => {
  it('accepts ws URLs with host and port', () => {
    expect(isSupportedNmeaUrl('ws://192.168.1.100:3000/signalk/v1/stream')).toBe(true)
  })

  it('accepts wss URLs', () => {
    expect(isSupportedNmeaUrl('wss://boat.example.com/signalk/v1/stream')).toBe(true)
  })

  it('rejects bare words that the browser would resolve as relative paths', () => {
    expect(isSupportedNmeaUrl('hola')).toBe(false)
  })

  it('rejects http and https URLs', () => {
    expect(isSupportedNmeaUrl('http://192.168.1.100:3000')).toBe(false)
    expect(isSupportedNmeaUrl('https://sail-trim.vercel.app')).toBe(false)
  })

  it('rejects empty strings and URLs without host', () => {
    expect(isSupportedNmeaUrl('')).toBe(false)
    expect(isSupportedNmeaUrl('ws://')).toBe(false)
  })
})
