import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import LegalModal from '../LegalModal'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key.endsWith('.sections')
        ? [
            { title: 'Primera sección', text: 'Texto de la primera.' },
            { title: 'Segunda sección', text: 'Texto de la segunda.' },
          ]
        : key,
  }),
}))

describe('LegalModal', () => {
  it('renders nothing when no document is selected', () => {
    const { container } = render(<LegalModal doc={null} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the selected document with all sections', () => {
    render(<LegalModal doc="privacy" onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('legal.privacy.title')).toBeInTheDocument()
    expect(screen.getByText('Primera sección')).toBeInTheDocument()
    expect(screen.getByText('Texto de la segunda.')).toBeInTheDocument()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(<LegalModal doc="terms" onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when the backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<LegalModal doc="privacy" onClose={onClose} />)
    const backdrop = container.querySelector('[aria-hidden="true"]')
    expect(backdrop).not.toBeNull()
    fireEvent.click(backdrop as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes with the close button', () => {
    const onClose = vi.fn()
    render(<LegalModal doc="terms" onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('legal.close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
