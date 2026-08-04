import { findTerm, WORD_REGEX } from '../lib/glossary-utils'
import { GlossaryTerm } from './GlossaryPopover'

function GlossaryAwareText({ text }: { text: string }) {
  const regex = new RegExp(WORD_REGEX.source, WORD_REGEX.flags)
  const segments: { text: string; isTerm: boolean; entry?: ReturnType<typeof findTerm> }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const word = match[1]
    const entry = findTerm(word)
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index)
      segments.push({ text: plain, isTerm: false })
    }
    if (entry) {
      segments.push({ text: word, isTerm: true, entry })
    } else {
      segments.push({ text: word, isTerm: false })
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isTerm: false })
  }
  if (segments.length === 0) {
    return <>{text}</>
  }
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.isTerm && seg.entry) {
          return (
            <GlossaryTerm key={i} word={seg.text} entry={seg.entry}>
              {seg.text}
            </GlossaryTerm>
          )
        }
        return <span key={i}>{seg.text}</span>
      })}
    </>
  )
}

function ItalicMd({ text }: { text: string }) {
  const parts = text.split(/\*([^*\n]+)\*/g)
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <em key={i} className="text-sail-400">
              <GlossaryAwareText text={part} />
            </em>
          )
        }
        const cleaned = part.replace(/\*/g, '')
        return cleaned ? <GlossaryAwareText key={i} text={cleaned} /> : null
      })}
    </>
  )
}

export function GlossaryInlineMd({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-white font-semibold">
            <GlossaryAwareText text={part} />
          </strong>
        ) : (
          <ItalicMd key={i} text={part} />
        ),
      )}
    </>
  )
}
