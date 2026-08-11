import { afterEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useOnlineStatus } from '../useOnlineStatus'

describe('useOnlineStatus', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true })
  })

  it('returns the current navigator.onLine value', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it('updates to false when offline event fires', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true, writable: true })
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current).toBe(false)
  })

  it('updates to true when online event fires after being offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true, writable: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true })
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current).toBe(true)
  })
})
