import { useCallback, useState } from 'react'

export function MessageCopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    } catch {
      // clipboard not available
    }
  }, [text])

  return (
    <button
      onClick={copy}
      aria-label="Copiar mensaje"
      className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-2 right-2 p-1.5 rounded-lg bg-ocean-950/80 border border-ocean-700/40 hover:border-cyan-500/30 text-sail-600 hover:text-cyan-300 transition-all duration-200"
    >
      {done ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}
