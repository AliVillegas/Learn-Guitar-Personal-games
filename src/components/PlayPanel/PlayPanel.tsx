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
  onPlayMeasure: (measureIndex: number) => void
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
  measureCount: MeasureCount,
  isPlayingAudio: boolean,
  onPlayAll: () => void,
  onPlayCurrentNote: () => void,
  onPlayMeasure: (measureIndex: number) => void
) {
  const currentNote = getCurrentNote(notes, currentIndex)
  return (
    <PlaybackControls
      notes={noteDefinitions}
      currentNote={currentNote}
      measureCount={measureCount}
      onPlayAll={onPlayAll}
      onPlayCurrentNote={onPlayCurrentNote}
      onPlayMeasure={onPlayMeasure}
      isPlaying={isPlayingAudio}
    />
  )
}

function renderStaffSection(notes: GameNote[], measureCount: MeasureCount, highlightIndex: number) {
  return <Staff notes={notes} measureCount={measureCount} currentIndex={highlightIndex} />
}

function renderScoreSection(notes: GameNote[]) {
  const correctCount = calculateCorrectCount(notes)
  return <ScoreDisplay correct={correctCount} total={notes.length} />
}

function renderAllSections(props: PlayPanelProps, highlightIndex: number) {
  return (
    <>
      {renderStaffSection(props.notes, props.measureCount, highlightIndex)}
      {renderPlaybackSection(
        props.notes,
        props.currentIndex,
        props.noteDefinitions,
        props.measureCount,
        props.isPlayingAudio,
        props.onPlayAll,
        props.onPlayCurrentNote,
        props.onPlayMeasure
      )}
      {renderAnswerSection(
        props.isComplete,
        props.isPlayingAudio,
        props.feedbackState,
        props.onAnswerSelect
      )}
      {renderScoreSection(props.notes)}
    </>
  )
}

export function PlayPanel(props: PlayPanelProps) {
  const highlightIndex = getHighlightIndex(
    props.isPlayingAudio,
    props.playingIndex,
    props.currentIndex
  )

  return <div className="space-y-6">{renderAllSections(props, highlightIndex)}</div>
}
