import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MarkdownText } from '../MarkdownText'
import { mergeNumberedLines } from '../../lib/markdown'

describe('mergeNumberedLines', () => {
  it('joins a lone number with the line below it', () => {
    expect(mergeNumberedLines(['1.', 'Caza el pajarín de la mayor'])).toEqual([
      '1. Caza el pajarín de la mayor',
    ])
  })

  it('leaves lines that are not split lists untouched', () => {
    expect(mergeNumberedLines(['uno', '', 'dos'])).toEqual(['uno', '', 'dos'])
  })
})

describe('MarkdownText', () => {
  it('renders headings, bullets and numbered steps', () => {
    const { container } = render(
      <MarkdownText text={'## Trimado\n\n- Sube la mayor\n\n1. Caza el pajarín'} />,
    )
    expect(container.querySelector('h3')?.textContent).toBe('Trimado')
    expect(container.textContent).toContain('Sube la mayor')
    expect(container.textContent).toContain('Caza el pajarín')
  })

  it('keeps the same output in both variants', () => {
    const text = '### Ajuste\n1.\nTensa el backstay'
    const chat = render(<MarkdownText text={text} />)
    const panel = render(<MarkdownText text={text} variant="panel" />)
    expect(chat.container.textContent).toBe(panel.container.textContent)
    expect(panel.container.textContent).toContain('Tensa el backstay')
  })
})
