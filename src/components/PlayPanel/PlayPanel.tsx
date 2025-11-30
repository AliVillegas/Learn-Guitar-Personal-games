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
  onPlayCurrentNote: () => void
  onAnswerSelect: (note: SolfegeNote) => void
  playingIndex: number | null
}

function calculateCorrectCount(notes: GameNote[]): number {
  return notes.filter((n) => n.status === 'correct').length
}

function getCurrentNote(notes: GameNote[], currentIndex: number): NoteDefinition | null {
  return notes[currentIndex]?.note || null
}

function renderAnswerSection(
  isComplete: boolean,
  isPlayingAudio: boolean,
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>,
  onAnswerSelect: (note: SolfegeNote) => void
) {
  if (isComplete) return null
  return (
    <AnswerSection
      isPlayingAudio={isPlayingAudio}
      feedbackState={feedbackState}
      onAnswerSelect={onAnswerSelect}
    />
  )
}

function getHighlightIndex(
  isPlayingAudio: boolean,
  playingIndex: number | null,
  currentIndex: number
): number {
  return isPlayingAudio && playingIndex !== null ? playingIndex : currentIndex
}

function renderPlaybackSection(
  notes: GameNote[],
  currentIndex: number,
  noteDefinitions: NoteDefinition[],
  isPlayingAudio: boolean,
  onPlayAll: () => void,
  onPlayCurrentNote: () => void
) {
  const currentNote = getCurrentNote(notes, currentIndex)
  return (
    <PlaybackControls
      notes={noteDefinitions}
      currentNote={currentNote}
      onPlayAll={onPlayAll}
      onPlayCurrentNote={onPlayCurrentNote}
      isPlaying={isPlayingAudio}
    />
  )
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
  onPlayCurrentNote,
  onAnswerSelect,
  playingIndex,
}: PlayPanelProps) {
  const correctCount = calculateCorrectCount(notes)
  const highlightIndex = getHighlightIndex(isPlayingAudio, playingIndex, currentIndex)

  return (
    <div className="space-y-6">
      <Staff notes={notes} measureCount={measureCount} currentIndex={highlightIndex} />
      {renderPlaybackSection(
        notes,
        currentIndex,
        noteDefinitions,
        isPlayingAudio,
        onPlayAll,
        onPlayCurrentNote
      )}
      {renderAnswerSection(isComplete, isPlayingAudio, feedbackState, onAnswerSelect)}
      <ScoreDisplay correct={correctCount} total={notes.length} />
    </div>
  )
}
