import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstrumentSelector } from './InstrumentSelector'
import { RouterWrapper } from '../../test/routerWrapper'

describe('InstrumentSelector', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with current instrument', () => {
    render(
      <RouterWrapper>
        <InstrumentSelector instrument="midi" onChange={mockOnChange} />
      </RouterWrapper>
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('midi')
  })

  it('calls onChange when instrument is changed', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <InstrumentSelector instrument="midi" onChange={mockOnChange} />
      </RouterWrapper>
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'guitar-synth')

    expect(mockOnChange).toHaveBeenCalledWith('guitar-synth')
  })

  it('displays all instrument options', () => {
    render(
      <RouterWrapper>
        <InstrumentSelector instrument="midi" onChange={mockOnChange} />
      </RouterWrapper>
    )

    expect(screen.getByRole('option', { name: 'MIDI' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Guitar (Synth)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Guitar (Classical)' })).toBeInTheDocument()
  })
})
