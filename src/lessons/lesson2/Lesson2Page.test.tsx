import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lesson2Page } from './Lesson2Page'
import { useLesson2Store } from './lesson2Store'
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
      playTimedSequence: vi.fn().mockResolvedValue(undefined),
      playErrorSound: vi.fn(),
      playSuccessSound: vi.fn(),
      isPlaying: false,
      playingIndex: null,
    }),
  }
})

function createTestMultiVoiceNote() {
  return {
    id: '1',
    bassVoice: [{ note: createNoteDefinition('mi', 3), duration: 'h.' as const }],
    melodyVoice: [
      { note: null, duration: 'qr' as const },
      { note: createNoteDefinition('sol', 4), duration: 'q' as const },
      { note: createNoteDefinition('la', 4), duration: 'q' as const },
    ],
    status: 'active' as const,
  }
}

describe('Lesson2Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLesson2Store.setState({
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
        measureCount: 4,
        melodyStrings: 'both',
        instrument: 'guitar-classical',
      },
      sequence: [createTestMultiVoiceNote()],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('renders game panel when phase is playing', () => {
    render(
      <RouterWrapper>
        <Lesson2Page />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/play all/i)).toBeInTheDocument()
  })

  it('renders regenerate button', () => {
    render(
      <RouterWrapper>
        <Lesson2Page />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument()
  })

  it('renders back to home button', () => {
    render(
      <RouterWrapper>
        <Lesson2Page />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /back to lessons/i })).toBeInTheDocument()
  })

  it('does not render answer section for multi-voice', () => {
    render(
      <RouterWrapper>
        <Lesson2Page />
      </RouterWrapper>
    )

    expect(screen.queryByText(/identify the note/i)).not.toBeInTheDocument()
  })

  it('renders result panel when phase is complete', () => {
    useLesson2Store.setState({
      ...useLesson2Store.getState(),
      phase: 'complete',
    })

    render(
      <RouterWrapper>
        <Lesson2Page />
      </RouterWrapper>
    )

    expect(screen.getByText(/round complete/i)).toBeInTheDocument()
  })

  it('navigates to home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson2Page />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders config when phase is config', () => {
    useLesson2Store.setState({
      ...useLesson2Store.getState(),
      phase: 'config',
    })

    const { container } = render(
      <RouterWrapper>
        <Lesson2Page />
      </RouterWrapper>
    )

    expect(container.firstChild).not.toBeNull()
  })
})
