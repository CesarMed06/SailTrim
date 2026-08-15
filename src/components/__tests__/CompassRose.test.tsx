import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import CompassRose from '../CompassRose'

describe('CompassRose', () => {
  it('renders as a slider with the current angle', () => {
    render(<CompassRose angle={45} onChange={() => {}} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '45')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '180')
  })

  it('increases the angle with ArrowRight', () => {
    const onChange = vi.fn()
    render(<CompassRose angle={45} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(60)
  })

  it('decreases the angle with ArrowLeft', () => {
    const onChange = vi.fn()
    render(<CompassRose angle={45} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith(30)
  })

  it('supports ArrowUp and ArrowDown', () => {
    const onChange = vi.fn()
    render(<CompassRose angle={90} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledWith(105)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' })
    expect(onChange).toHaveBeenCalledWith(75)
  })

  it('jumps to the extremes with Home and End', () => {
    const onChange = vi.fn()
    render(<CompassRose angle={45} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' })
    expect(onChange).toHaveBeenCalledWith(0)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    expect(onChange).toHaveBeenCalledWith(180)
  })

  it('clamps the angle between 0 and 180', () => {
    const onChange = vi.fn()
    const { rerender } = render(<CompassRose angle={0} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith(0)

    rerender(<CompassRose angle={180} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(180)
  })
})
