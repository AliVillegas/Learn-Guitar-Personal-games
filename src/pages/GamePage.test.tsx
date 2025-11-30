import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GamePage } from './GamePage'
import { useGameStore } from '../store/gameStore'
import { createNoteDefinition } from '../utils/notes'
import { RouterWrapper } from '../test/routerWrapper'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGameStore.setState({
      phase: 'playing',
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
      sequence: [
        {
          id: '1',
          note: createNoteDefinition('mi', 3),
          status: 'active',
        },
        {
          id: '2',
          note: createNoteDefinition('fa', 3),
          status: 'pending',
        },
        {
          id: '3',
          note: createNoteDefinition('sol', 3),
          status: 'pending',
        },
        {
          id: '4',
          note: createNoteDefinition('la', 3),
          status: 'pending',
        },
      ],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('renders game panel when phase is playing', () => {
    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })

  it('renders regenerate button', () => {
    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument()
  })

  it('renders back to config button', () => {
    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /back to config/i })).toBeInTheDocument()
  })

  it('calls navigate when regenerate button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    const regenerateButton = screen.getByRole('button', { name: /regenerate/i })
    await user.click(regenerateButton)

    expect(useGameStore.getState().phase).toBe('playing')
  })

  it('renders result panel when phase is complete', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'complete',
    })

    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByText(/round complete/i)).toBeInTheDocument()
  })

  it('navigates to config when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to config/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/config')
  })
})
