import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lesson2Config } from './Lesson2Config'
import { useLesson2Store } from './lesson2Store'
import { RouterWrapper } from '../../test/routerWrapper'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Lesson2Config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLesson2Store.setState({
      phase: 'config',
      config: {
        measureCount: 4,
        noteMode: 'single',
      },
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('renders measure selector', () => {
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    expect(screen.getByText(/measures/i)).toBeInTheDocument()
    const selects = screen.getAllByRole('combobox')
    const measureSelect = selects.find((el) => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.some((opt) => opt.value === '4' || opt.value === '5')
    })
    expect(measureSelect).toBeInTheDocument()
  })

  it('renders note mode selector', () => {
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    expect(screen.getByText(/note mode/i)).toBeInTheDocument()
    const select = screen.getAllByRole('combobox').find((el) => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.some((opt) => opt.textContent?.toLowerCase().includes('single'))
    })
    expect(select).toBeInTheDocument()
  })

  it('renders all three mode options', () => {
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const selects = screen.getAllByRole('combobox')
    const modeSelect = selects.find((el) => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.length === 3 && options.some((opt) => opt.value === 'single')
    })
    expect(modeSelect).toBeInTheDocument()
    if (modeSelect) {
      const options = Array.from(modeSelect.querySelectorAll('option'))
      expect(options.some((opt) => opt.value === 'single')).toBe(true)
      expect(options.some((opt) => opt.value === 'stacked')).toBe(true)
      expect(options.some((opt) => opt.value === 'mixed')).toBe(true)
    }
  })

  it('renders generate button', () => {
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('generates sequence when generate button is clicked', async () => {
    const user = userEvent.setup()
    const generateSequenceSpy = vi.spyOn(useLesson2Store.getState(), 'generateSequence')
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const generateButton = screen.getByRole('button', { name: /generate/i })
    await user.click(generateButton)

    expect(generateSequenceSpy).toHaveBeenCalled()
  })

  it('updates measure count when selector changes', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const selects = screen.getAllByRole('combobox')
    const measureSelect = selects.find((el) => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.some((opt) => opt.value === '4' || opt.value === '5')
    })
    expect(measureSelect).toBeInTheDocument()
    if (measureSelect) {
      await user.selectOptions(measureSelect, '5')
      expect(useLesson2Store.getState().config.measureCount).toBe(5)
    }
  })

  it('updates noteMode when selector changes', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const selects = screen.getAllByRole('combobox')
    const modeSelect = selects.find((el) => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.some((opt) => opt.value === 'stacked')
    })
    expect(modeSelect).toBeInTheDocument()
    if (modeSelect) {
      await user.selectOptions(modeSelect, 'stacked')
      expect(useLesson2Store.getState().config.noteMode).toBe('stacked')
    }
  })

  it('displays current noteMode from store', () => {
    useLesson2Store.setState({
      config: {
        measureCount: 4,
        noteMode: 'mixed',
      },
    })

    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const selects = screen.getAllByRole('combobox')
    const modeSelect = selects.find((el) => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.some((opt) => opt.value === 'mixed')
    })
    expect(modeSelect).toBeInTheDocument()
    if (modeSelect) {
      expect(modeSelect).toHaveValue('mixed')
    }
  })

  it('renders back to home button', () => {
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    expect(backButton).toBeInTheDocument()
  })

  it('navigates home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
