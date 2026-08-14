import { GlossaryInlineMd } from './GlossaryInlineMd'

function mergeNumberedLines(lines: string[]): string[] {
  const merged: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const soloNum = line.match(/^(\d+)[.)]\s*$/)
    if (soloNum && i + 1 < lines.length && lines[i + 1].trim() && !/^\d+[.)]\s*$/.test(lines[i + 1])) {
      merged.push(`${soloNum[1]}. ${lines[i + 1]}`)
      i += 2
      continue
    }
    merged.push(line)
    i++
  }
  return merged
}

export function ChatMarkdown({ text }: { text: string }) {
  const rawLines = text.split(/\r?\n/)
  const lines = mergeNumberedLines(rawLines)

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} />
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="text-sm font-semibold text-sail-300 pt-1">
              <GlossaryInlineMd text={line.slice(4)} />
            </h4>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-base font-bold text-cyan-300 pt-2 first:pt-0">
              <GlossaryInlineMd text={line.slice(3)} />
            </h3>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 text-sail-500 leading-relaxed">
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
            <div key={i} className="flex gap-2.5 text-sail-500 leading-relaxed">
              <span className="text-cyan-500/70 shrink-0 mt-0.5 font-mono text-xs w-5 text-right">
                {numbered[1]}.
              </span>
              <span>
                <GlossaryInlineMd text={numbered[2]} />
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
