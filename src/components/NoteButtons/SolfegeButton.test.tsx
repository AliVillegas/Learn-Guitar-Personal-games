import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SolfegeButton } from './SolfegeButton'
import { RouterWrapper } from '../../test/routerWrapper'

describe('SolfegeButton', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders note text', () => {
    render(
      <RouterWrapper>
        <SolfegeButton note="mi" onSelect={mockOnSelect} disabled={false} feedbackState="idle" />
      </RouterWrapper>
    )

    expect(screen.getByText(/Mi \(E\)/i)).toBeInTheDocument()
  })

  it('calls onSelect when clicked and not disabled', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <SolfegeButton note="mi" onSelect={mockOnSelect} disabled={false} feedbackState="idle" />
      </RouterWrapper>
    )

    const button = screen.getByText(/Mi \(E\)/i)
    await user.click(button)

    expect(mockOnSelect).toHaveBeenCalledWith('mi')
  })

  it('does not call onSelect when disabled', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <SolfegeButton note="mi" onSelect={mockOnSelect} disabled={true} feedbackState="idle" />
      </RouterWrapper>
    )

    const button = screen.getByText(/Mi \(E\)/i)
    await user.click(button)

    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('applies correct variant for correct feedback', () => {
    render(
      <RouterWrapper>
        <SolfegeButton note="mi" onSelect={mockOnSelect} disabled={false} feedbackState="correct" />
      </RouterWrapper>
    )

    const button = screen.getByText(/Mi \(E\)/i)
    expect(button).toBeInTheDocument()
  })

  it('applies correct variant for incorrect feedback', () => {
    render(
      <RouterWrapper>
        <SolfegeButton
          note="mi"
          onSelect={mockOnSelect}
          disabled={false}
          feedbackState="incorrect"
        />
      </RouterWrapper>
    )

    const button = screen.getByText(/Mi \(E\)/i)
    expect(button).toBeInTheDocument()
  })

  it('applies correct variant for idle feedback', () => {
    render(
      <RouterWrapper>
        <SolfegeButton note="mi" onSelect={mockOnSelect} disabled={false} feedbackState="idle" />
      </RouterWrapper>
    )

    const button = screen.getByText(/Mi \(E\)/i)
    expect(button).toBeInTheDocument()
  })
})
