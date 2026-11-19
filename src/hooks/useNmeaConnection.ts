import { useState, useRef, useCallback, useEffect } from 'react'
import { processFeedBuffer } from '../lib/nmea-parser'
import type { ParsedWind, NmeaFeedLine } from '../types'

interface NmeaConnectionState {
  isConnected: boolean
  isLoading: boolean
  latestWind: ParsedWind | null
  feedLines: NmeaFeedLine[]
  error: string | null
}

export function isSupportedNmeaUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return (parsed.protocol === 'ws:' || parsed.protocol === 'wss:') && parsed.hostname !== ''
  } catch {
    return false
  }
}

export function useNmeaConnection() {
  const [state, setState] = useState<NmeaConnectionState>({
    isConnected: false,
    isLoading: false,
    latestWind: null,
    feedLines: [],
    error: null,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef(0)

  const connect = useCallback((url: string) => {
    if (window.location.protocol === 'https:' && url.startsWith('ws://')) {
      setState((prev) => ({ ...prev, isLoading: false, error: 'nmea.errorMixedContent' }))
      return
    }

    if (!isSupportedNmeaUrl(url)) {
      setState((prev) => ({ ...prev, isLoading: false, error: 'nmea.errorInvalidUrl' }))
      return
    }

    attemptRef.current += 1
    const attempt = attemptRef.current

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (attempt !== attemptRef.current) return
      setState((prev) => ({ ...prev, isConnected: true, isLoading: false, error: null }))
    }

    ws.onmessage = (event) => {
      if (attempt !== attemptRef.current) return
      const data = typeof event.data === 'string' ? event.data : ''
      if (!data) return

      setState((prev) => {
        const result = processFeedBuffer(data, prev.feedLines)
        return {
          ...prev,
          feedLines: result.lines,
          latestWind: result.latestWind || prev.latestWind,
        }
      })
    }

    ws.onerror = () => {
      if (attempt !== attemptRef.current) return
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error: 'nmea.errorConnection',
      }))
    }

    ws.onclose = () => {
      if (attempt !== attemptRef.current) return
      wsRef.current = null
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    attemptRef.current += 1
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setState({
      isConnected: false,
      isLoading: false,
      latestWind: null,
      feedLines: [],
      error: null,
    })
  }, [])

  useEffect(() => {
    return () => {
      attemptRef.current += 1
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  return { ...state, connect, disconnect }
}
