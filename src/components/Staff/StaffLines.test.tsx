import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StaffLines } from './StaffLines'

describe('StaffLines', () => {
  it('renders 5 staff lines', () => {
    const { container } = render(<StaffLines />)
    const lines = container.querySelectorAll('.staff-line')
    expect(lines).toHaveLength(5)
  })

  it('renders within staff-lines container', () => {
    const { container } = render(<StaffLines />)
    const staffLinesContainer = container.querySelector('.staff-lines')
    expect(staffLinesContainer).toBeInTheDocument()
  })
})
