import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlayPanel } from './PlayPanel'
import { createNoteDefinition } from '../../utils/notes'
import type { GameNote, MeasureCount } from '../../types/music'

function createTestNotes(count: number): GameNote[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${i}`,
    note: createNoteDefinition('do', 3),
    status: i === 0 ? 'active' : 'pending',
  }))
}

describe('PlayPanel', () => {
  const mockOnPlayAll = vi.fn()
  const mockOnPlayCurrentNote = vi.fn()
  const mockOnPlayMeasure = vi.fn()
  const mockOnAnswerSelect = vi.fn()

  const defaultProps = {
    notes: createTestNotes(4),
    measureCount: 1 as MeasureCount,
    currentIndex: 0,
    noteDefinitions: [createNoteDefinition('do', 3)],
    isComplete: false,
    isPlayingAudio: false,
    feedbackState: {
      do: 'idle' as const,
      re: 'idle' as const,
      mi: 'idle' as const,
      fa: 'idle' as const,
      sol: 'idle' as const,
      la: 'idle' as const,
      si: 'idle' as const,
    },
    onPlayAll: mockOnPlayAll,
    onPlayCurrentNote: mockOnPlayCurrentNote,
    onPlayMeasure: mockOnPlayMeasure,
    onAnswerSelect: mockOnAnswerSelect,
    playingIndex: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all sections when not complete', () => {
    render(<PlayPanel {...defaultProps} />)

    expect(screen.getByText(/identify the highlighted note/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play all/i })).toBeInTheDocument()
    expect(screen.getByText(/score:/i)).toBeInTheDocument()
  })

  it('hides answer section when complete', () => {
    render(<PlayPanel {...defaultProps} isComplete={true} />)

    expect(screen.queryByText(/identify the highlighted note/i)).not.toBeInTheDocument()
  })

  it('calculates correct count from notes', () => {
    const notesWithCorrect = [
      { ...createTestNotes(1)[0], status: 'correct' as const },
      { ...createTestNotes(1)[0], status: 'pending' as const },
      { ...createTestNotes(1)[0], status: 'correct' as const },
    ]

    render(<PlayPanel {...defaultProps} notes={notesWithCorrect} />)

    expect(screen.getByText(/score: 2\/3/i)).toBeInTheDocument()
  })

  it('renders playback controls', () => {
    render(<PlayPanel {...defaultProps} />)

    expect(screen.getByRole('button', { name: /play all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play current note/i })).toBeInTheDocument()
  })

  it('renders score display with correct values', () => {
    const notesWithScore = [
      { ...createTestNotes(1)[0], status: 'correct' as const },
      { ...createTestNotes(1)[0], status: 'correct' as const },
      { ...createTestNotes(1)[0], status: 'pending' as const },
    ]

    render(<PlayPanel {...defaultProps} notes={notesWithScore} />)

    expect(screen.getByText(/score: 2\/3/i)).toBeInTheDocument()
  })
})
