import { GlossaryInlineMd } from './GlossaryInlineMd'
import { mergeNumberedLines } from '../lib/markdown'

type Variant = 'chat' | 'panel'

const STYLES: Record<
  Variant,
  { gap: string; h4: string; h3: string; bullet: string }
> = {
  chat: {
    gap: 'space-y-2',
    h4: 'text-sm font-semibold text-sail-300 pt-1',
    h3: 'text-base font-bold text-cyan-300 pt-2 first:pt-0',
    bullet: 'gap-2',
  },
  panel: {
    gap: 'space-y-3',
    h4: 'text-base font-display font-semibold text-sail-300 pt-2',
    h3: 'text-lg font-display font-bold text-cyan-300 pt-3 first:pt-0',
    bullet: 'gap-2.5',
  },
}

export function MarkdownText({
  text,
  variant = 'chat',
}: {
  text: string
  variant?: Variant
}) {
  const styles = STYLES[variant]
  const lines = mergeNumberedLines(text.split(/\r?\n/))

  return (
    <div className={styles.gap}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} />
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className={styles.h4}>
              <GlossaryInlineMd text={line.slice(4)} />
            </h4>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className={styles.h3}>
              <GlossaryInlineMd text={line.slice(3)} />
            </h3>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className={`flex ${styles.bullet} text-sail-500 leading-relaxed`}>
              <span className="text-cyan-500/70 shrink-0 mt-0.5">▸</span>
              <span>
                <GlossaryInlineMd text={line.slice(2)} />
              </span>
            </div>
          )
        }
        const numbered = line.match(/^(\d+)[.)]\s+(.*)$/)
        if (numbered) {
          return (
            <div key={i} className={`flex ${styles.bullet} text-sail-500 leading-relaxed`}>
              <span className="text-cyan-500/70 shrink-0 mt-0.5 font-mono text-xs w-5 text-right">
                {numbered[1]}.
              </span>
              <span>
                <GlossaryInlineMd text={numbered[2] ?? ''} />
              </span>
            </div>
          )
        }
        return (
          <p key={i} className="text-sail-500 leading-relaxed">
            <GlossaryInlineMd text={line} />
          </p>
        )
      })}
    </div>
  )
}
