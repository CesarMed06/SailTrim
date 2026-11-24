export function mergeNumberedLines(lines: string[]): string[] {
  const merged: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    const next = lines[i + 1]
    const soloNum = line.match(/^(\d+)[.)]\s*$/)
    if (soloNum && next && next.trim() && !/^\d+[.)]\s*$/.test(next)) {
      merged.push(`${soloNum[1]}. ${next}`)
      i += 2
      continue
    }
    merged.push(line)
    i++
  }
  return merged
}
