import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LessonRenderer, ResultRenderer } from './LessonRenderer'
import { createNoteDefinition } from '../../utils/notes'
import { RouterWrapper } from '../../test/routerWrapper'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

function createTestGameNote() {
  return {
    id: '1',
    note: createNoteDefinition('mi', 3),
    status: 'active' as const,
  }
}

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

describe('LessonRenderer', () => {
  const defaultProps = {
    sequence: [createTestGameNote()],
    measureCount: 1 as const,
    currentIndex: 0,
    highlightIndex: 0,
    isPlaying: false,
    noteDefinitions: [createNoteDefinition('mi', 3)],
    showAnswerSection: true,
    showScore: true,
    feedbackState: {
      do: 'idle' as const,
      re: 'idle' as const,
      mi: 'idle' as const,
      fa: 'idle' as const,
      sol: 'idle' as const,
      la: 'idle' as const,
      si: 'idle' as const,
    },
    onAnswerSelect: vi.fn(),
    onPlayAll: vi.fn(),
    onPlayCurrentNote: vi.fn(),
    onPlayMeasure: vi.fn(),
    onRegenerate: vi.fn(),
    onGoToHome: vi.fn(),
  }

  it('renders navigation buttons', () => {
    render(
      <RouterWrapper>
        <LessonRenderer {...defaultProps} />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /backToHome/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument()
  })

  it('renders answer section when showAnswerSection is true', () => {
    render(
      <RouterWrapper>
        <LessonRenderer {...defaultProps} />
      </RouterWrapper>
    )

    expect(screen.getByText(/identifyNote/i)).toBeInTheDocument()
  })

  it('does not render answer section when showAnswerSection is false', () => {
    render(
      <RouterWrapper>
        <LessonRenderer {...defaultProps} showAnswerSection={false} />
      </RouterWrapper>
    )

    expect(screen.queryByText(/identifyNote/i)).not.toBeInTheDocument()
  })

  it('renders score when showScore is true', () => {
    render(
      <RouterWrapper>
        <LessonRenderer {...defaultProps} />
      </RouterWrapper>
    )

    expect(screen.getByText(/score/i)).toBeInTheDocument()
  })

  it('does not render score when showScore is false', () => {
    render(
      <RouterWrapper>
        <LessonRenderer {...defaultProps} showScore={false} />
      </RouterWrapper>
    )

    expect(screen.queryByText(/score/i)).not.toBeInTheDocument()
  })

  it('renders with multi-voice notes', () => {
    render(
      <RouterWrapper initialEntries={['/game/lesson2']}>
        <LessonRenderer
          {...defaultProps}
          sequence={[createTestMultiVoiceNote()]}
          noteDefinitions={[createNoteDefinition('mi', 3), createNoteDefinition('sol', 4)]}
          showAnswerSection={false}
        />
      </RouterWrapper>
    )

    expect(screen.getByLabelText('game.playAll')).toBeInTheDocument()
  })
})

describe('ResultRenderer', () => {
  it('renders result panel with score', () => {
    render(<ResultRenderer correct={5} total={10} onPlayAgain={vi.fn()} onGoToHome={vi.fn()} />)

    expect(screen.getByText(/complete/i)).toBeInTheDocument()
    expect(screen.getByText(/finalScore/i)).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<ResultRenderer correct={5} total={10} onPlayAgain={vi.fn()} onGoToHome={vi.fn()} />)

    expect(screen.getByRole('button', { name: /backToHome/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /playAgain/i })).toBeInTheDocument()
  })
})
