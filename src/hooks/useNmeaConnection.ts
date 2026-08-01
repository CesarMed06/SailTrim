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

export function useNmeaConnection() {
  const [state, setState] = useState<NmeaConnectionState>({
    isConnected: false,
    isLoading: false,
    latestWind: null,
    feedLines: [],
    error: null,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const urlRef = useRef<string | null>(null)

  const connect = useCallback((url: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        urlRef.current = url
        wsRef.current = ws
        setState(prev => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          error: null,
        }))
      }

      ws.onmessage = (event) => {
        const data = typeof event.data === 'string' ? event.data : ''
        if (!data) return

        setState(prev => {
          const result = processFeedBuffer(data, prev.feedLines)
          return {
            ...prev,
            feedLines: result.lines,
            latestWind: result.latestWind || prev.latestWind,
          }
        })
      }

      ws.onerror = () => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isConnected: false,
          error: 'No se pudo conectar al barco. Verifica la IP y que el WiFi del barco esté activo.',
        }))
      }

      ws.onclose = () => {
        wsRef.current = null
        urlRef.current = null
        setState(prev => ({
          ...prev,
          isConnected: false,
          isLoading: false,
        }))
      }
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'URL inválida. Usa ws://IP:puerto/ruta',
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    urlRef.current = null
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
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return { ...state, connect, disconnect }
}
