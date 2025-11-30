import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeasureSelector } from './MeasureSelector'
import { RouterWrapper } from '../../test/routerWrapper'

describe('MeasureSelector', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with current measure count', () => {
    render(
      <RouterWrapper>
        <MeasureSelector measureCount={2} onChange={mockOnChange} />
      </RouterWrapper>
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('2')
  })

  it('calls onChange when measure count is changed', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <MeasureSelector measureCount={1} onChange={mockOnChange} />
      </RouterWrapper>
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '3')

    expect(mockOnChange).toHaveBeenCalledWith(3)
  })

  it('displays all measure options', () => {
    render(
      <RouterWrapper>
        <MeasureSelector measureCount={1} onChange={mockOnChange} />
      </RouterWrapper>
    )

    expect(screen.getByRole('option', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '4' })).toBeInTheDocument()
  })
})
