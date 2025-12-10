import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppContent } from './AppContent'
import { useGameStore } from '../../store/gameStore'
import { createNoteDefinition } from '../../utils/notes'

vi.mock('../../hooks/useAppHandlers', async () => {
  const actual = await vi.importActual('../../hooks/useAppHandlers')
  return {
    ...actual,
    useAppHandlers: () => ({
      handleToggleStringNote: vi.fn(),
      handleChangeMeasure: vi.fn(),
      handleChangeInstrument: vi.fn(),
      handleGenerate: vi.fn(),
      audio: { isPlaying: false, playingIndex: null },
      feedback: { feedbackState: {} },
      handlePlayAgain: vi.fn(),
      handlePlayAll: vi.fn(),
      handlePlayCurrentNote: vi.fn(),
      handlePlayMeasure: vi.fn(),
      handleAnswerSelect: vi.fn(),
    }),
  }
})

describe('AppContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGameStore.setState({
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
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('renders ConfigSection when phase is config', () => {
    render(<AppContent />)
    expect(screen.getByText(/generate/i)).toBeInTheDocument()
  })

  it('renders ResultPanel when phase is complete', () => {
    useGameStore.setState({
      phase: 'complete',
      score: { correct: 5, incorrect: 5 },
      sequence: Array(10).fill(null),
    })

    render(<AppContent />)
    expect(screen.getByText(/complete/i)).toBeInTheDocument()
  })

  it('renders PlayPanel when phase is playing', () => {
    useGameStore.setState({
      phase: 'playing',
      sequence: [
        {
          id: '1',
          note: createNoteDefinition('do', 3),
          status: 'pending',
        },
      ],
      currentIndex: 0,
    })

    render(<AppContent />)
    expect(screen.getByText(/identify the highlighted note/i)).toBeInTheDocument()
  })

  it('returns null for unknown phase', () => {
    useGameStore.setState({
      phase: 'unknown' as any,
    })

    const { container } = render(<AppContent />)
    expect(container.firstChild).toBeNull()
  })
})
