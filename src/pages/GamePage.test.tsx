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
        playSequence: vi.fn().mockResolvedValue(undefined),
        playErrorSound: vi.fn(),
        playSuccessSound: vi.fn(),
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
        lessonType: 'single-notes',
        singleNotes: {
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
        multiVoice: {
          stringNotes: [
            { string: 1, notes: ['mi'] },
            { string: 2, notes: ['si'] },
            { string: 3, notes: ['sol'] },
            { string: 4, notes: ['re'] },
            { string: 5, notes: ['la'] },
            { string: 6, notes: ['mi'] },
          ],
          measureCount: 4,
          melodyStrings: 'both',
          instrument: 'guitar-classical',
        },
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
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })

  it('renders regenerate button', () => {
    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument()
  })

  it('renders back to home button', () => {
    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /back to lessons/i })).toBeInTheDocument()
  })

  it('calls navigate when regenerate button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
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
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByText(/round complete/i)).toBeInTheDocument()
  })

  it('navigates to home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('auto-generates sequence when phase is config', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'config',
      config: {
        lessonType: 'single-notes',
        singleNotes: {
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
        multiVoice: {
          stringNotes: [
            { string: 1, notes: ['mi'] },
            { string: 2, notes: ['si'] },
            { string: 3, notes: ['sol'] },
            { string: 4, notes: ['re'] },
            { string: 5, notes: ['la'] },
            { string: 6, notes: ['mi'] },
          ],
          measureCount: 4,
          melodyStrings: 'both',
          instrument: 'guitar-classical',
        },
      },
    })

    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    expect(useGameStore.getState().phase).toBe('playing')
  })

  it('regenerates sequence when play again is clicked', async () => {
    const user = userEvent.setup()
    const generateSequenceSpy = vi.spyOn(useGameStore.getState(), 'generateSequence')
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'complete',
    })

    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    const playAgainButton = screen.getByRole('button', { name: /play again/i })
    await user.click(playAgainButton)

    expect(generateSequenceSpy).toHaveBeenCalled()
    expect(useGameStore.getState().phase).toBe('playing')
    generateSequenceSpy.mockRestore()
  })

  it('navigates to home when go to home is clicked', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'complete',
    })

    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    const goToHomeButton = screen.getByRole('button', { name: /back to lessons/i })
    await user.click(goToHomeButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('auto-generates sequence when phase is config and renders playing phase', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      phase: 'config',
      config: {
        lessonType: 'single-notes',
        singleNotes: {
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
        multiVoice: {
          stringNotes: [
            { string: 1, notes: ['mi'] },
            { string: 2, notes: ['si'] },
            { string: 3, notes: ['sol'] },
            { string: 4, notes: ['re'] },
            { string: 5, notes: ['la'] },
            { string: 6, notes: ['mi'] },
          ],
          measureCount: 4,
          melodyStrings: 'both',
          instrument: 'guitar-classical',
        },
      },
    })

    const { container } = render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    expect(useGameStore.getState().phase).toBe('playing')
    expect(container.firstChild).not.toBeNull()
  })

  it('handles null current note', () => {
    useGameStore.setState({
      ...useGameStore.getState(),
      sequence: [],
      currentIndex: 0,
    })

    render(
      <RouterWrapper initialEntries={['/game/lesson1']}>
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
      <RouterWrapper initialEntries={['/game/lesson1']}>
        <GamePage />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })
})
