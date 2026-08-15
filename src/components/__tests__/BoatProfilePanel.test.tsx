import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import BoatProfilePanel from '../BoatProfilePanel'

beforeEach(() => {
  localStorage.clear()
})

describe('BoatProfilePanel', () => {
  it('shows the configure prompt when no profile is set', () => {
    render(<BoatProfilePanel />)
    expect(screen.getByText(/Configura tu barco/i)).toBeInTheDocument()
  })

  it('opens the form when clicking configure', () => {
    render(<BoatProfilePanel />)
    fireEvent.click(screen.getByText(/Configura tu barco/i))
    expect(screen.getByText('Guardar perfil')).toBeInTheDocument()
  })

  it('saves name and model, collapsing into the summary', () => {
    render(<BoatProfilePanel />)
    fireEvent.click(screen.getByText(/Configura tu barco/i))

    fireEvent.change(screen.getByPlaceholderText('ej. Sagres'), { target: { value: 'Alisio' } })
    fireEvent.change(screen.getByPlaceholderText('ej. Bavaria 34'), { target: { value: 'Bavaria 34' } })

    fireEvent.click(screen.getByText('Guardar perfil'))

    expect(screen.getByText('Alisio')).toBeInTheDocument()
    expect(screen.getByText('Bavaria 34')).toBeInTheDocument()
  })
})
