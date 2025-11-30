import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteSelector } from './NoteSelector'
import { RouterWrapper } from '../../test/routerWrapper'

describe('NoteSelector', () => {
  const mockOnToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all solfege notes', () => {
    render(
      <RouterWrapper>
        <NoteSelector selectedNotes={[]} onToggle={mockOnToggle} />
      </RouterWrapper>
    )

    expect(screen.getByText(/Do \(C\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Re \(D\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Mi \(E\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Fa \(F\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Sol \(G\)/i)).toBeInTheDocument()
    expect(screen.getByText(/La \(A\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Si \(B\)/i)).toBeInTheDocument()
  })

  it('calls onToggle when a note checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <NoteSelector selectedNotes={[]} onToggle={mockOnToggle} />
      </RouterWrapper>
    )

    const miLabel = screen.getByText(/Mi \(E\)/i).closest('label')
    if (miLabel) {
      await user.click(miLabel)
    }

    expect(mockOnToggle).toHaveBeenCalledWith('mi')
  })

  it('shows checked state for selected notes', () => {
    render(
      <RouterWrapper>
        <NoteSelector selectedNotes={['mi', 'fa']} onToggle={mockOnToggle} />
      </RouterWrapper>
    )

    const miLabel = screen.getByText(/Mi \(E\)/i).closest('label')
    const faLabel = screen.getByText(/Fa \(F\)/i).closest('label')
    const doLabel = screen.getByText(/Do \(C\)/i).closest('label')

    const miCheckbox = miLabel?.querySelector('input[type="checkbox"]')
    const faCheckbox = faLabel?.querySelector('input[type="checkbox"]')
    const doCheckbox = doLabel?.querySelector('input[type="checkbox"]')

    expect(miCheckbox).toBeChecked()
    expect(faCheckbox).toBeChecked()
    expect(doCheckbox).not.toBeChecked()
  })
})
