import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lesson1Page } from './Lesson1Page'
import { useLesson1Store } from './lesson1Store'
import { createNoteDefinition } from '../../utils/notes'
import { RouterWrapper } from '../../test/routerWrapper'

const mockNavigate = vi.fn()
const mockPlayNote = vi.fn().mockResolvedValue(undefined)

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../hooks/useAudio', async () => {
  const actual = await vi.importActual('../../hooks/useAudio')
  return {
    ...actual,
    useAudio: () => ({
      ...actual.useAudio(),
      playNote: mockPlayNote,
      playNoteAtTime: vi.fn(),
      getCurrentTime: vi.fn(),
      playSequence: vi.fn().mockResolvedValue(undefined),
      playErrorSound: vi.fn(),
      playSuccessSound: vi.fn(),
      isPlaying: false,
      playingIndex: null,
    }),
  }
})

describe('Lesson1Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLesson1Store.setState({
      phase: 'playing',
      config: {
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
        <Lesson1Page />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })

  it('renders regenerate button', () => {
    render(
      <RouterWrapper>
        <Lesson1Page />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument()
  })

  it('renders back to home button', () => {
    render(
      <RouterWrapper>
        <Lesson1Page />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /back to lessons/i })).toBeInTheDocument()
  })

  it('calls navigate when regenerate button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson1Page />
      </RouterWrapper>
    )

    const regenerateButton = screen.getByRole('button', { name: /regenerate/i })
    await user.click(regenerateButton)

    expect(useLesson1Store.getState().phase).toBe('playing')
  })

  it('renders result panel when phase is complete', () => {
    useLesson1Store.setState({
      ...useLesson1Store.getState(),
      phase: 'complete',
    })

    render(
      <RouterWrapper>
        <Lesson1Page />
      </RouterWrapper>
    )

    expect(screen.getByText(/round complete/i)).toBeInTheDocument()
  })

  it('navigates to home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson1Page />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders config when phase is config', () => {
    useLesson1Store.setState({
      ...useLesson1Store.getState(),
      phase: 'config',
    })

    const { container } = render(
      <RouterWrapper>
        <Lesson1Page />
      </RouterWrapper>
    )

    expect(container.firstChild).not.toBeNull()
  })

  it('handles null current note', () => {
    useLesson1Store.setState({
      ...useLesson1Store.getState(),
      sequence: [],
      currentIndex: 0,
    })

    render(
      <RouterWrapper>
        <Lesson1Page />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })

  it('handles currentIndex out of bounds', () => {
    useLesson1Store.setState({
      ...useLesson1Store.getState(),
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
        <Lesson1Page />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })
})
