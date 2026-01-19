import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/Staff/Staff'
import { PlaybackControls } from '../../components/PlaybackControls/PlaybackControls'
import { AnswerSection } from '../../components/PlayPanel/AnswerSection'
import { ScoreDisplay } from '../../components/ScoreDisplay/ScoreDisplay'
import { ResultPanel } from '../../components/ResultPanel/ResultPanel'
import { BpmControl } from '../../components/BpmControl/BpmControl'
import { Button } from '../../components/ui/button'
import type {
  GameNote,
  MultiVoiceGameNote,
  MeasureCount,
  MultiVoiceMeasureCount,
  NoteDefinition,
  SolfegeNote,
} from '../../types/music'
import { getCurrentNoteDefinition, calculateCorrectCount } from './lessonHelpers'

interface LessonRendererProps {
  sequence: GameNote[] | MultiVoiceGameNote[]
  measureCount: MeasureCount | MultiVoiceMeasureCount | number
  currentIndex: number
  highlightIndex: number
  isPlaying: boolean
  noteDefinitions: NoteDefinition[]
  showAnswerSection: boolean
  showScore: boolean
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>
  onAnswerSelect: (note: SolfegeNote) => void
  onPlayAll: (notes: NoteDefinition[]) => void
  onPlayCurrentNote: () => void
  onPlayMeasure: (measureIndex: number) => void
  onRegenerate: () => void
  onGoToHome: () => void
}

type LessonContentProps = Omit<
  LessonRendererProps,
  'currentIndex' | 'onRegenerate' | 'onGoToHome'
> & {
  currentNoteDefinition: NoteDefinition | null
}

function renderNavigationButtons(
  t: (key: string) => string,
  onGoToHome: () => void,
  onRegenerate: () => void,
  isPlaying: boolean
) {
  return (
    <div className="flex justify-between items-center">
      <Button onClick={onGoToHome} variant="ghost" disabled={isPlaying}>
        {t('app.backToHome')}
      </Button>
      <Button onClick={onRegenerate} variant="secondary" disabled={isPlaying}>
        {t('game.regenerate')}
      </Button>
    </div>
  )
}

function renderStaffSection(
  sequence: GameNote[] | MultiVoiceGameNote[],
  measureCount: MeasureCount | MultiVoiceMeasureCount | number,
  highlightIndex: number,
  isPlaying: boolean
) {
  return (
    <div className="space-y-2">
      <BpmControl disabled={isPlaying} />
      <Staff notes={sequence} measureCount={measureCount} currentIndex={highlightIndex} />
    </div>
  )
}

function renderAnswerAndScore(
  showAnswerSection: boolean,
  showScore: boolean,
  sequence: GameNote[] | MultiVoiceGameNote[],
  isPlaying: boolean,
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>,
  onAnswerSelect: (note: SolfegeNote) => void
) {
  return (
    <>
      {showAnswerSection && (
        <AnswerSection
          isPlayingAudio={isPlaying}
          feedbackState={feedbackState}
          onAnswerSelect={onAnswerSelect}
        />
      )}
      {showScore && (
        <ScoreDisplay correct={calculateCorrectCount(sequence)} total={sequence.length} />
      )}
    </>
  )
}

function renderPlaybackSection(
  noteDefinitions: NoteDefinition[],
  currentNoteDefinition: NoteDefinition | null,
  measureCount: MeasureCount | MultiVoiceMeasureCount | number,
  onPlayAll: (notes: NoteDefinition[]) => void,
  onPlayCurrentNote: () => void,
  onPlayMeasure: (measureIndex: number) => void,
  isPlaying: boolean,
  showPlayCurrentNote: boolean
) {
  return (
    <PlaybackControls
      notes={noteDefinitions}
      currentNote={currentNoteDefinition}
      measureCount={measureCount}
      onPlayAll={onPlayAll}
      onPlayCurrentNote={onPlayCurrentNote}
      onPlayMeasure={onPlayMeasure}
      isPlaying={isPlaying}
      showPlayCurrentNote={showPlayCurrentNote}
    />
  )
}

function getCurrentNoteDefinitionFromSequence(
  sequence: GameNote[] | MultiVoiceGameNote[],
  currentIndex: number
): NoteDefinition | null {
  const currentNote = sequence[currentIndex] || null
  return currentNote ? getCurrentNoteDefinition(currentNote) : null
}

function renderStaffAndPlaybackContent(
  sequence: GameNote[] | MultiVoiceGameNote[],
  measureCount: MeasureCount | MultiVoiceMeasureCount | number,
  highlightIndex: number,
  isPlaying: boolean,
  noteDefinitions: NoteDefinition[],
  currentNoteDefinition: NoteDefinition | null,
  showAnswerSection: boolean,
  onPlayAll: (notes: NoteDefinition[]) => void,
  onPlayCurrentNote: () => void,
  onPlayMeasure: (measureIndex: number) => void
) {
  return (
    <>
      {renderStaffSection(sequence, measureCount, highlightIndex, isPlaying)}
      {renderPlaybackSection(
        noteDefinitions,
        currentNoteDefinition,
        measureCount,
        onPlayAll,
        onPlayCurrentNote,
        onPlayMeasure,
        isPlaying,
        showAnswerSection
      )}
    </>
  )
}

function renderStaffAndPlaybackSection(
  sequence: GameNote[] | MultiVoiceGameNote[],
  measureCount: MeasureCount | MultiVoiceMeasureCount | number,
  highlightIndex: number,
  isPlaying: boolean,
  noteDefinitions: NoteDefinition[],
  currentNoteDefinition: NoteDefinition | null,
  showAnswerSection: boolean,
  onPlayAll: (notes: NoteDefinition[]) => void,
  onPlayCurrentNote: () => void,
  onPlayMeasure: (measureIndex: number) => void
) {
  return renderStaffAndPlaybackContent(
    sequence,
    measureCount,
    highlightIndex,
    isPlaying,
    noteDefinitions,
    currentNoteDefinition,
    showAnswerSection,
    onPlayAll,
    onPlayCurrentNote,
    onPlayMeasure
  )
}

function renderAnswerAndScoreSection(
  showAnswerSection: boolean,
  showScore: boolean,
  sequence: GameNote[] | MultiVoiceGameNote[],
  isPlaying: boolean,
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>,
  onAnswerSelect: (note: SolfegeNote) => void
) {
  return renderAnswerAndScore(
    showAnswerSection,
    showScore,
    sequence,
    isPlaying,
    feedbackState,
    onAnswerSelect
  )
}

function buildStaffAndPlaybackSection(
  sequence: GameNote[] | MultiVoiceGameNote[],
  measureCount: MeasureCount | MultiVoiceMeasureCount | number,
  highlightIndex: number,
  isPlaying: boolean,
  noteDefinitions: NoteDefinition[],
  currentNoteDefinition: NoteDefinition | null,
  showAnswerSection: boolean,
  onPlayAll: (notes: NoteDefinition[]) => void,
  onPlayCurrentNote: () => void,
  onPlayMeasure: (measureIndex: number) => void
) {
  return renderStaffAndPlaybackSection(
    sequence,
    measureCount,
    highlightIndex,
    isPlaying,
    noteDefinitions,
    currentNoteDefinition,
    showAnswerSection,
    onPlayAll,
    onPlayCurrentNote,
    onPlayMeasure
  )
}

function buildAnswerAndScoreSection(
  showAnswerSection: boolean,
  showScore: boolean,
  sequence: GameNote[] | MultiVoiceGameNote[],
  isPlaying: boolean,
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>,
  onAnswerSelect: (note: SolfegeNote) => void
) {
  return renderAnswerAndScoreSection(
    showAnswerSection,
    showScore,
    sequence,
    isPlaying,
    feedbackState,
    onAnswerSelect
  )
}

function buildStaffSection(props: {
  sequence: GameNote[] | MultiVoiceGameNote[]
  measureCount: MeasureCount | MultiVoiceMeasureCount | number
  highlightIndex: number
  isPlaying: boolean
  noteDefinitions: NoteDefinition[]
  currentNoteDefinition: NoteDefinition | null
  showAnswerSection: boolean
  onPlayAll: (notes: NoteDefinition[]) => void
  onPlayCurrentNote: () => void
  onPlayMeasure: (measureIndex: number) => void
}) {
  return buildStaffAndPlaybackSection(
    props.sequence,
    props.measureCount,
    props.highlightIndex,
    props.isPlaying,
    props.noteDefinitions,
    props.currentNoteDefinition,
    props.showAnswerSection,
    props.onPlayAll,
    props.onPlayCurrentNote,
    props.onPlayMeasure
  )
}

function buildAnswerSection(props: {
  showAnswerSection: boolean
  showScore: boolean
  sequence: GameNote[] | MultiVoiceGameNote[]
  isPlaying: boolean
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>
  onAnswerSelect: (note: SolfegeNote) => void
}) {
  return buildAnswerAndScoreSection(
    props.showAnswerSection,
    props.showScore,
    props.sequence,
    props.isPlaying,
    props.feedbackState,
    props.onAnswerSelect
  )
}

function buildLessonContentSections(props: LessonContentProps) {
  const staffAndPlayback = buildStaffSection({
    sequence: props.sequence,
    measureCount: props.measureCount,
    highlightIndex: props.highlightIndex,
    isPlaying: props.isPlaying,
    noteDefinitions: props.noteDefinitions,
    currentNoteDefinition: props.currentNoteDefinition,
    showAnswerSection: props.showAnswerSection,
    onPlayAll: props.onPlayAll,
    onPlayCurrentNote: props.onPlayCurrentNote,
    onPlayMeasure: props.onPlayMeasure,
  })
  const answerAndScore = buildAnswerSection({
    showAnswerSection: props.showAnswerSection,
    showScore: props.showScore,
    sequence: props.sequence,
    isPlaying: props.isPlaying,
    feedbackState: props.feedbackState,
    onAnswerSelect: props.onAnswerSelect,
  })
  return { staffAndPlayback, answerAndScore }
}

function renderLessonContent(props: LessonContentProps) {
  const { staffAndPlayback, answerAndScore } = buildLessonContentSections(props)
  return (
    <>
      {staffAndPlayback}
      {answerAndScore}
    </>
  )
}

function prepareAndRenderContent(props: LessonRendererProps) {
  const currentNoteDefinition = getCurrentNoteDefinitionFromSequence(
    props.sequence,
    props.currentIndex
  )
  return renderLessonContent({
    sequence: props.sequence,
    measureCount: props.measureCount,
    highlightIndex: props.highlightIndex,
    isPlaying: props.isPlaying,
    noteDefinitions: props.noteDefinitions,
    currentNoteDefinition,
    showAnswerSection: props.showAnswerSection,
    showScore: props.showScore,
    feedbackState: props.feedbackState,
    onAnswerSelect: props.onAnswerSelect,
    onPlayAll: props.onPlayAll,
    onPlayCurrentNote: props.onPlayCurrentNote,
    onPlayMeasure: props.onPlayMeasure,
  })
}

export function LessonRenderer(props: LessonRendererProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {renderNavigationButtons(t, props.onGoToHome, props.onRegenerate, props.isPlaying)}
      {prepareAndRenderContent(props)}
    </div>
  )
}

interface ResultRendererProps {
  correct: number
  total: number
  onPlayAgain: () => void
  onGoToHome: () => void
}

export function ResultRenderer({ correct, total, onPlayAgain, onGoToHome }: ResultRendererProps) {
  return (
    <ResultPanel
      correct={correct}
      total={total}
      onPlayAgain={onPlayAgain}
      onGoToConfig={onPlayAgain}
      onGoToHome={onGoToHome}
    />
  )
}
