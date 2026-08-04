import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORY_LABELS, type GlossaryEntry } from '../data/glossary'

interface GlossaryPopoverProps {
  term: string
  entry: GlossaryEntry
  parentRect: DOMRect
  onClose: () => void
}

function GlossaryPopover({ term, entry, parentRect, onClose }: GlossaryPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    let top = parentRect.bottom + 8
    let left = parentRect.left + parentRect.width / 2 - rect.width / 2
    if (top + rect.height > window.innerHeight - 16) {
      top = parentRect.top - rect.height - 8
    }
    if (left < 8) left = 8
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8
    setPos({ top, left })
  }, [parentRect])

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler)
      document.addEventListener('touchstart', handler)
      document.addEventListener('keydown', keyHandler)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [onClose])

  if (!pos) {
    return createPortal(
      <div ref={ref} className="fixed opacity-0 pointer-events-none z-[60]">
        <PopoverContent term={term} entry={entry} />
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[60] animate-fade-in"
      style={{ top: pos.top, left: pos.left }}
    >
      <PopoverContent term={term} entry={entry} />
    </div>,
    document.body,
  )
}

function PopoverContent({ term, entry }: { term: string; entry: GlossaryEntry }) {
  return (
    <div className="bg-ocean-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-xl p-4 max-w-xs w-72">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{CATEGORY_LABELS[entry.category].split(' ')[0]}</span>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-cyan-400/70">
          {CATEGORY_LABELS[entry.category].split(' ').slice(1).join(' ')}
        </span>
      </div>
      <h4 className="text-white font-bold text-base mb-2">{term}</h4>
      <p className="text-sail-400 text-sm leading-relaxed">{entry.definition}</p>
    </div>
  )
}

interface GlossaryTermProps {
  word: string
  entry: GlossaryEntry
  children: string
}

export function GlossaryTerm({ word, entry, children }: GlossaryTermProps) {
  const termRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (termRef.current) {
        setRect(termRef.current.getBoundingClientRect())
        setOpen((prev) => !prev)
      }
    },
    [],
  )

  return (
    <>
      <span
        ref={termRef}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            if (termRef.current) {
              setRect(termRef.current.getBoundingClientRect())
              setOpen((prev) => !prev)
            }
          }
        }}
        className="cursor-pointer border-b border-dotted border-cyan-500/50 hover:border-cyan-400 text-cyan-200 hover:text-cyan-100 transition-colors duration-150"
        title={`${word}: ${entry.definition}`}
      >
        {children}
      </span>
      {open && rect && (
        <GlossaryPopover
          term={word}
          entry={entry}
          parentRect={rect}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
