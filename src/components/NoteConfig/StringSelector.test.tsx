import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StringSelector } from './StringSelector'
import { RouterWrapper } from '../../test/routerWrapper'

describe('StringSelector', () => {
  const mockOnToggleNote = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all guitar strings', () => {
    render(
      <RouterWrapper>
        <StringSelector stringNotes={[]} onToggleNote={mockOnToggleNote} />
      </RouterWrapper>
    )

    expect(screen.getByText(/1st String/i)).toBeInTheDocument()
    expect(screen.getByText(/6th String/i)).toBeInTheDocument()
  })

  it('calls onToggleNote when a note checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <StringSelector stringNotes={[{ string: 1, notes: [] }]} onToggleNote={mockOnToggleNote} />
      </RouterWrapper>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0])
      expect(mockOnToggleNote).toHaveBeenCalled()
    }
  })

  it('shows checked state for selected notes', () => {
    render(
      <RouterWrapper>
        <StringSelector
          stringNotes={[{ string: 1, notes: ['mi'] }]}
          onToggleNote={mockOnToggleNote}
        />
      </RouterWrapper>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const checkedCheckboxes = checkboxes.filter((cb) => (cb as HTMLInputElement).checked)
    expect(checkedCheckboxes.length).toBeGreaterThan(0)
  })

  it('handles string config not found', () => {
    render(
      <RouterWrapper>
        <StringSelector stringNotes={[]} onToggleNote={mockOnToggleNote} />
      </RouterWrapper>
    )

    expect(screen.getByText(/select notes for each string/i)).toBeInTheDocument()
  })
})
