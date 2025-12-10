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
        stringNotes: [],
        measureCount: 4,
        allowStackedNotes: true,
        instrument: 'guitar-classical',
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
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders stacked notes checkbox', () => {
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/stacked notes/i)).toBeInTheDocument()
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

    const measureSelect = screen.getByRole('combobox')
    await user.selectOptions(measureSelect, '5')

    expect(useLesson2Store.getState().config.measureCount).toBe(5)
  })

  it('updates allowStackedNotes when checkbox changes', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson2Config />
      </RouterWrapper>
    )

    const stackedCheckbox = screen.getByLabelText(/stacked notes/i)
    await user.click(stackedCheckbox)

    expect(useLesson2Store.getState().config.allowStackedNotes).toBe(false)
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
