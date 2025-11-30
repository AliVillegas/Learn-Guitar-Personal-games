import { Staff } from '../Staff/Staff'
import { PlaybackControls } from '../PlaybackControls/PlaybackControls'
import { AnswerSection } from './AnswerSection'
import { ScoreDisplay } from '../ScoreDisplay/ScoreDisplay'
import type { GameNote, MeasureCount } from '../../types/music'
import type { SolfegeNote } from '../../types/music'
import type { NoteDefinition } from '../../types/music'

interface PlayPanelProps {
  notes: GameNote[]
  measureCount: MeasureCount
  currentIndex: number
  noteDefinitions: NoteDefinition[]
  isComplete: boolean
  isPlayingAudio: boolean
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>
  onPlayAll: () => void
  onAnswerSelect: (note: SolfegeNote) => void
}

function calculateCorrectCount(notes: GameNote[]): number {
  return notes.filter((n) => n.status === 'correct').length
}

export function PlayPanel({
  notes,
  measureCount,
  currentIndex,
  noteDefinitions,
  isComplete,
  isPlayingAudio,
  feedbackState,
  onPlayAll,
  onAnswerSelect,
}: PlayPanelProps) {
  return (
    <div className="play-panel">
      <Staff
        notes={notes}
        measureCount={measureCount}
        currentIndex={currentIndex}
      />

      <PlaybackControls
        notes={noteDefinitions}
        onPlayAll={onPlayAll}
        isPlaying={isPlayingAudio}
      />

      {!isComplete && (
        <AnswerSection
          isPlayingAudio={isPlayingAudio}
          feedbackState={feedbackState}
          onAnswerSelect={onAnswerSelect}
        />
      )}

      <ScoreDisplay
        correct={calculateCorrectCount(notes)}
        total={notes.length}
      />
    </div>
  )
}

