import { useCallback, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface HintTooltipProps {
  label: string
  text: string
  children: ReactNode
  className?: string
}

export default function HintTooltip({ label, text, children, className = 'inline-flex' }: HintTooltipProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null)

  const show = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const half = 128
    const left = Math.min(Math.max(rect.left + rect.width / 2, half + 8), window.innerWidth - half - 8)
    setPos({ top: rect.top < 140 ? rect.bottom + 8 : rect.top - 8, left, below: rect.top < 140 })
  }, [])

  const hide = useCallback(() => setPos(null), [])

  return (
    <span
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className={className}
    >
      {children}
      {pos && createPortal(
        <div
          role="tooltip"
          style={{ top: pos.top, left: pos.left }}
          className={`pointer-events-none fixed z-[60] w-64 -translate-x-1/2 animate-fade-in ${pos.below ? '' : '-translate-y-full'}`}
        >
          <div className="bg-ocean-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-xl p-3">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-cyan-400/70 mb-1">{label}</p>
            <p className="text-sail-300 text-xs leading-relaxed">{text}</p>
          </div>
        </div>,
        document.body,
      )}
    </span>
  )
}
