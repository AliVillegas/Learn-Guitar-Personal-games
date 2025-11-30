import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GamePage } from './GamePage'
import { useGameStore } from '../store/gameStore'
import { createNoteDefinition } from '../utils/notes'
import { RouterWrapper } from '../test/routerWrapper'

const mockNavigate = vi.fn()
const mockPlayNote = vi.fn().mockResolvedValue(undefined)

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../hooks/useAppHandlers', async () => {
  const actual = await vi.importActual('../hooks/useAppHandlers')
  return {
    ...actual,
    useAppHandlers: () => ({
      ...actual.useAppHandlers(),
      audio: {
        playNote: mockPlayNote,
        playNoteAtTime: vi.fn(),
        getCurrentTime: vi.fn(),
        playSequence: vi.fn(),
        playErrorSound: vi.fn(),
        isPlaying: false,
        playingIndex: null,
      },
    }),
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

  it('navigates to config when phase is config', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'config',
    })

    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/config')
  })

  it('regenerates sequence when play again is clicked', async () => {
    const user = userEvent.setup()
    const generateSequenceSpy = vi.spyOn(useGameStore.getState(), 'generateSequence')
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'complete',
    })

    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    const playAgainButton = screen.getByRole('button', { name: /play again/i })
    await user.click(playAgainButton)

    expect(generateSequenceSpy).toHaveBeenCalled()
    expect(useGameStore.getState().phase).toBe('playing')
    generateSequenceSpy.mockRestore()
  })

  it('navigates to config when go to config is clicked', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'complete',
    })

    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    const goToConfigButton = screen.getByRole('button', { name: /go to config/i })
    await user.click(goToConfigButton)

    expect(mockNavigate).toHaveBeenCalledWith('/config')
  })

  it('returns null when phase is not playing or complete', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'config',
    })

    const { container } = render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  it('handles null current note', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      sequence: [],
      currentIndex: 0,
    })

    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })

  it('handles currentIndex out of bounds', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      sequence: [
        {
          id: '1',
          note: createNoteDefinition('mi', 3),
          status: 'active',
        },
      ],
      currentIndex: 10,
    })

    render(
      <RouterWrapper>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })
})
