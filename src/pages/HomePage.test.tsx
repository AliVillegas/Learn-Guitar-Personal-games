import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from './HomePage'
import { RouterWrapper } from '../test/routerWrapper'
import { useSettingsStore } from '../store/settingsStore'
import { useLesson1Store } from '../lessons/lesson1/lesson1Store'
import { useLesson2Store } from '../lessons/lesson2/lesson2Store'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSettingsStore.setState({
      selectedLesson: null,
      instrument: 'guitar-classical',
      playbackBpm: 120,
      metronomeEnabled: false,
      metronomeSubdivision: 1,
    })
    useLesson1Store.getState().reset()
    useLesson2Store.getState().reset()
  })

  it('renders title', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    )

    expect(screen.getByText(/choose a lesson/i)).toBeInTheDocument()
  })

  it('renders lesson cards', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    )

    expect(screen.getByText(/lesson 1: first position notes/i)).toBeInTheDocument()
    expect(screen.getByText(/lesson 2: multi-voice reading/i)).toBeInTheDocument()
  })

  it('navigates to lesson1 when single-notes lesson is selected', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    )

    const buttons = screen.getAllByRole('button', { name: /start lesson/i })
    await user.click(buttons[0])

    expect(mockNavigate).toHaveBeenCalledWith('/game/lesson1')
    expect(useSettingsStore.getState().selectedLesson).toBe('single-notes')
  })

  it('navigates to lesson2 when multi-voice lesson is selected', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    )

    const buttons = screen.getAllByRole('button', { name: /start lesson/i })
    await user.click(buttons[1])

    expect(mockNavigate).toHaveBeenCalledWith('/game/lesson2')
    expect(useSettingsStore.getState().selectedLesson).toBe('multi-voice')
  })

  it('resets lesson stores when navigating', async () => {
    const user = userEvent.setup()
    const resetLesson1 = vi.spyOn(useLesson1Store.getState(), 'reset')
    const resetLesson2 = vi.spyOn(useLesson2Store.getState(), 'reset')

    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    )

    const buttons = screen.getAllByRole('button', { name: /start lesson/i })
    await user.click(buttons[0])

    expect(resetLesson1).toHaveBeenCalled()

    await user.click(buttons[1])

    expect(resetLesson2).toHaveBeenCalled()
  })
})
