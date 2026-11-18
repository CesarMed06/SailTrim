import { describe, expect, it } from 'vitest'
import { parseNmeaSentence, parseSignalKDelta } from '../nmea-parser'

describe('parseNmeaSentence', () => {
  it('parses a valid $WIMWV sentence with relative wind', () => {
    const result = parseNmeaSentence('$WIMWV,045,R,12.5,N,A*0A')
    expect(result).not.toBeNull()
    expect(result?.direction).toBe(45)
    expect(result?.speedKnots).toBe(12.5)
    expect(result?.isTrue).toBe(false)
    expect(result?.force).toBeGreaterThanOrEqual(3)
  })

  it('parses a valid $WIMWV sentence with true wind', () => {
    const result = parseNmeaSentence('$WIMWV,090,T,20.0,N,A*00')
    expect(result).not.toBeNull()
    expect(result?.direction).toBe(90)
    expect(result?.speedKnots).toBe(20)
    expect(result?.isTrue).toBe(true)
  })

  it('returns null for an empty string', () => {
    expect(parseNmeaSentence('')).toBeNull()
  })

  it('returns null for a non-NMEA string', () => {
    expect(parseNmeaSentence('hello world')).toBeNull()
  })

  it('returns null when fields are missing (too few)', () => {
    expect(parseNmeaSentence('$WIMWV,045,R,12.5')).toBeNull()
  })

  it('returns null for NaN direction', () => {
    expect(parseNmeaSentence('$WIMWV,abc,R,12.5,N,A*35')).toBeNull()
  })

  it('returns null for NaN speed', () => {
    expect(parseNmeaSentence('$WIMWV,045,R,xyz,N,A*3E')).toBeNull()
  })

  it('parses $IIMWV variant', () => {
    const result = parseNmeaSentence('$IIMWV,135,T,15.0,N,A*16')
    expect(result).not.toBeNull()
    expect(result?.direction).toBe(135)
    expect(result?.isTrue).toBe(true)
  })

  it('handles knots-to-beaufort for light wind', () => {
    const result = parseNmeaSentence('$WIMWV,010,R,3.0,N,A*3F')
    expect(result?.force).toBe(1)
  })

  it('handles knots-to-beaufort for strong wind', () => {
    const result = parseNmeaSentence('$WIMWV,010,R,25.0,N,A*0B')
    expect(result?.force).toBe(6)
  })

  it('converts kilometres per hour to knots', () => {
    const result = parseNmeaSentence('$WIMWV,045,R,20.0,K,A')
    expect(result?.speedKnots).toBe(10.8)
  })

  it('converts metres per second to knots', () => {
    const result = parseNmeaSentence('$WIMWV,045,R,10.0,M,A')
    expect(result?.speedKnots).toBe(19.4)
  })

  it('rejects a sentence marked as invalid (V)', () => {
    expect(parseNmeaSentence('$WIMWV,045,R,12.5,N,V')).toBeNull()
  })

  it('rejects an unknown speed unit', () => {
    expect(parseNmeaSentence('$WIMWV,045,R,12.5,X,A')).toBeNull()
  })
})

describe('parseSignalKDelta', () => {
  it('converts true wind direction from radians to degrees', () => {
    const msg = JSON.stringify({
      updates: [
        {
          values: [
            { path: 'environment.wind.directionTrue', value: Math.PI / 4 },
            { path: 'environment.wind.speedTrue', value: 7.5 },
          ],
        },
      ],
    })
    const result = parseSignalKDelta(msg)
    expect(result).not.toBeNull()
    expect(result?.direction).toBeCloseTo(45, 1)
    expect(result?.speedKnots).toBeCloseTo(14.6, 1)
    expect(result?.isTrue).toBe(true)
  })

  it('flags apparent wind as not true', () => {
    const msg = JSON.stringify({
      updates: [
        {
          values: [
            { path: 'environment.wind.directionApparent', value: Math.PI / 2 },
            { path: 'environment.wind.speedApparent', value: 10 },
          ],
        },
      ],
    })
    const result = parseSignalKDelta(msg)
    expect(result).not.toBeNull()
    expect(result?.direction).toBeCloseTo(90, 1)
    expect(result?.isTrue).toBe(false)
  })

  it('returns null for invalid JSON', () => {
    expect(parseSignalKDelta('not json')).toBeNull()
  })

  it('returns null when updates is not an array', () => {
    expect(parseSignalKDelta('{"updates": "nope"}')).toBeNull()
  })

  it('returns null when values are missing', () => {
    const msg = JSON.stringify({ updates: [{ values: [] }] })
    expect(parseSignalKDelta(msg)).toBeNull()
  })

  it('returns null when message has no direction or speed', () => {
    const msg = JSON.stringify({
      updates: [{ values: [{ path: 'other.thing', value: 42 }] }],
    })
    expect(parseSignalKDelta(msg)).toBeNull()
  })
})
