import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigPage } from './ConfigPage'
import { useGameStore } from '../store/gameStore'
import { RouterWrapper } from '../test/routerWrapper'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGameStore.setState({
      phase: 'config',
      config: {
        selectedNotes: ['do', 're', 'mi'],
        stringNotes: [
          { string: 1, notes: ['mi'] },
          { string: 2, notes: ['si'] },
          { string: 3, notes: ['sol'] },
          { string: 4, notes: ['re'] },
          { string: 5, notes: ['la'] },
          { string: 6, notes: ['mi'] },
        ],
        measureCount: 1,
        instrument: 'guitar-classical',
      },
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('renders config section', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    expect(screen.getByText(/Select notes for each string/i)).toBeInTheDocument()
  })

  it('renders generate button', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('navigates to game page when generate is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const generateButton = screen.getByRole('button', { name: /generate/i })
    await user.click(generateButton)

    expect(mockNavigate).toHaveBeenCalledWith('/game')
    expect(useGameStore.getState().phase).toBe('playing')
  })
})
