import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfigPanel } from './ConfigPanel'
import { RouterWrapper } from '../../test/routerWrapper'

describe('ConfigPanel', () => {
  const mockOnToggleStringNote = vi.fn()
  const mockOnChangeMeasure = vi.fn()
  const mockOnChangeInstrument = vi.fn()
  const mockOnGenerate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all config sections', () => {
    render(
      <RouterWrapper>
        <ConfigPanel
          stringNotes={[{ string: 1, notes: ['mi'] }]}
          measureCount={1}
          instrument="midi"
          onToggleStringNote={mockOnToggleStringNote}
          onChangeMeasure={mockOnChangeMeasure}
          onChangeInstrument={mockOnChangeInstrument}
          onGenerate={mockOnGenerate}
        />
      </RouterWrapper>
    )

    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('shows warning when no notes are selected', () => {
    render(
      <RouterWrapper>
        <ConfigPanel
          stringNotes={[{ string: 1, notes: [] }]}
          measureCount={1}
          instrument="midi"
          onToggleStringNote={mockOnToggleStringNote}
          onChangeMeasure={mockOnChangeMeasure}
          onChangeInstrument={mockOnChangeInstrument}
          onGenerate={mockOnGenerate}
        />
      </RouterWrapper>
    )

    expect(screen.getByText(/select at least one note/i)).toBeInTheDocument()
  })

  it('disables generate button when no notes are selected', () => {
    render(
      <RouterWrapper>
        <ConfigPanel
          stringNotes={[{ string: 1, notes: [] }]}
          measureCount={1}
          instrument="midi"
          onToggleStringNote={mockOnToggleStringNote}
          onChangeMeasure={mockOnChangeMeasure}
          onChangeInstrument={mockOnChangeInstrument}
          onGenerate={mockOnGenerate}
        />
      </RouterWrapper>
    )

    const generateButton = screen.getByRole('button', { name: /generate/i })
    expect(generateButton).toBeDisabled()
  })

  it('enables generate button when notes are selected', () => {
    render(
      <RouterWrapper>
        <ConfigPanel
          stringNotes={[{ string: 1, notes: ['mi'] }]}
          measureCount={1}
          instrument="midi"
          onToggleStringNote={mockOnToggleStringNote}
          onChangeMeasure={mockOnChangeMeasure}
          onChangeInstrument={mockOnChangeInstrument}
          onGenerate={mockOnGenerate}
        />
      </RouterWrapper>
    )

    const generateButton = screen.getByRole('button', { name: /generate/i })
    expect(generateButton).not.toBeDisabled()
  })
})
