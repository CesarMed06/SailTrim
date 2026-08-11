import { beforeEach, describe, expect, it } from 'vitest'
import { parseSuggestedQuestions, stripSuggestedQuestions } from '../chat'

beforeEach(() => {
  localStorage.clear()
})

describe('parseSuggestedQuestions', () => {
  it('extracts dash-prefixed questions from Spanish marker', () => {
    const content = `Aquí tienes el plan.

## 💭 Preguntas
- ¿Debo rizar la mayor?
- ¿Cómo ajusto el foque?
- ¿Qué hago con el backstay?`
    const result = parseSuggestedQuestions(content)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('¿Debo rizar la mayor?')
    expect(result[1]).toBe('¿Cómo ajusto el foque?')
  })

  it('extracts dash-prefixed questions from English marker', () => {
    const content = `Here is the plan.

## 💭 Questions
- Should I reef the main?
- How do I adjust the jib?`
    const result = parseSuggestedQuestions(content)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('Should I reef the main?')
  })

  it('extracts star-prefixed questions', () => {
    const content = `Plan:\n\n## 💭 Preguntas\n* ¿Qué hago ahora?\n* ¿Y después?`
    const result = parseSuggestedQuestions(content)
    expect(result).toHaveLength(2)
  })

  it('extracts numbered questions', () => {
    const content = `Plan:\n\n## 💭 Preguntas\n1. ¿Primero?\n2. ¿Segundo?`
    const result = parseSuggestedQuestions(content)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('¿Primero?')
  })

  it('caps at 3 questions max', () => {
    const content = `## 💭 Preguntas\n- 1\n- 2\n- 3\n- 4\n- 5`
    const result = parseSuggestedQuestions(content)
    expect(result).toHaveLength(3)
  })

  it('returns empty array when no marker is present', () => {
    const result = parseSuggestedQuestions('Just normal text without markers.')
    expect(result).toEqual([])
  })

  it('ignores empty lines inside the section', () => {
    const content = `## 💭 Preguntas\n- Real question\n\n- Another one\n   \n- Third`
    const result = parseSuggestedQuestions(content)
    expect(result).toHaveLength(3)
  })
})

describe('stripSuggestedQuestions', () => {
  it('removes Spanish marker and everything after it', () => {
    const content = 'Contenido útil.\n\n## 💭 Preguntas\n- Una\n- Dos'
    const result = stripSuggestedQuestions(content)
    expect(result).toBe('Contenido útil.')
    expect(result).not.toContain('Preguntas')
  })

  it('removes English marker and everything after it', () => {
    const content = 'Useful content.\n\n## 💭 Questions\n- One\n- Two'
    const result = stripSuggestedQuestions(content)
    expect(result).toBe('Useful content.')
  })

  it('returns full text when no marker is present', () => {
    const content = 'Just content without any marker.'
    expect(stripSuggestedQuestions(content)).toBe(content)
  })
})
