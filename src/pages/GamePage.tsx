import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Staff } from '../components/Staff/Staff'
import { PlaybackControls } from '../components/PlaybackControls/PlaybackControls'
import { AnswerSection } from '../components/PlayPanel/AnswerSection'
import { ScoreDisplay } from '../components/ScoreDisplay/ScoreDisplay'
import { ResultPanel } from '../components/ResultPanel/ResultPanel'
import { Button } from '../components/ui/button'
import { useGameStore } from '../store/gameStore'
import { useAppHandlers } from '../hooks/useAppHandlers'
import type { MeasureCount } from '../types/music'
import type { SolfegeNote } from '../types/music'
import type { NoteDefinition } from '../types/music'

function calculateCorrectCount(notes: ReturnType<typeof useGameStore>['sequence']): number {
  return notes.filter((n) => n.status === 'correct').length
}

function getCurrentNote(
  notes: ReturnType<typeof useGameStore>['sequence'],
  currentIndex: number
): NoteDefinition | null {
  return notes[currentIndex]?.note || null
}

function getHighlightIndex(
  isPlayingAudio: boolean,
  playingIndex: number | null,
  currentIndex: number
): number {
  return isPlayingAudio && playingIndex !== null ? playingIndex : currentIndex
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

function renderPlaybackSection(
  notes: ReturnType<typeof useGameStore>['sequence'],
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

function renderStaffSection(
  notes: ReturnType<typeof useGameStore>['sequence'],
  measureCount: MeasureCount,
  highlightIndex: number
) {
  return <Staff notes={notes} measureCount={measureCount} currentIndex={highlightIndex} />
}

function renderScoreSection(notes: ReturnType<typeof useGameStore>['sequence']) {
  const correctCount = calculateCorrectCount(notes)
  return <ScoreDisplay correct={correctCount} total={notes.length} />
}

function renderCompletePhase(
  score: ReturnType<typeof useGameStore>['score'],
  sequenceLength: number,
  onPlayAgain: () => void,
  onGoToConfig: () => void
) {
  return (
    <ResultPanel
      correct={score.correct}
      total={sequenceLength}
      onPlayAgain={onPlayAgain}
      onGoToConfig={onGoToConfig}
    />
  )
}

function renderGameButtons(
  navigate: (path: string) => void,
  onRegenerate: () => void,
  t: (key: string) => string
) {
  return (
    <div className="flex justify-between items-center">
      <Button onClick={() => navigate('/config')} variant="ghost">
        {t('game.backToConfig')}
      </Button>
      <Button onClick={onRegenerate} variant="secondary">
        {t('game.regenerate')}
      </Button>
    </div>
  )
}

function renderGameContent(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  highlightIndex: number,
  noteDefinitions: NoteDefinition[]
) {
  return (
    <>
      {renderStaffSection(game.sequence, game.config.measureCount, highlightIndex)}
      {renderPlaybackSection(
        game.sequence,
        game.currentIndex,
        noteDefinitions,
        game.config.measureCount,
        handlers.audio.isPlaying,
        handlers.handlePlayAll,
        handlers.handlePlayCurrentNote,
        handlers.handlePlayMeasure
      )}
      {renderAnswerSection(
        false,
        handlers.audio.isPlaying,
        handlers.feedback.feedbackState,
        handlers.handleAnswerSelect
      )}
      {renderScoreSection(game.sequence)}
    </>
  )
}

function renderPlayingPhase(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  navigate: (path: string) => void,
  t: (key: string) => string
) {
  const noteDefinitions = game.sequence.map((gn) => gn.note)
  const highlightIndex = getHighlightIndex(
    handlers.audio.isPlaying,
    handlers.audio.playingIndex,
    game.currentIndex
  )

  const handleRegenerate = () => {
    handlers.feedback.reset()
    game.generateSequence()
  }

  return (
    <div className="space-y-6">
      {renderGameButtons(navigate, handleRegenerate, t)}
      {renderGameContent(game, handlers, highlightIndex, noteDefinitions)}
    </div>
  )
}

function playAllNotes(
  handlers: ReturnType<typeof useAppHandlers>,
  noteDefinitions: NoteDefinition[]
) {
  handlers.audio.playSequence(noteDefinitions).catch((error) => {
    console.error('Error playing sequence:', error)
  })
}

function isNewSequenceGenerated(
  game: ReturnType<typeof useGameStore>,
  previousLength: number
): boolean {
  return (
    game.phase === 'playing' &&
    game.currentIndex === 0 &&
    game.sequence.length > 0 &&
    previousLength !== game.sequence.length
  )
}

function usePlayAllOnGameStart(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>
) {
  const previousSequenceLengthRef = useRef<number>(0)

  useEffect(() => {
    if (isNewSequenceGenerated(game, previousSequenceLengthRef.current)) {
      const noteDefinitions = game.sequence.map((gn) => gn.note)
      playAllNotes(handlers, noteDefinitions)
    }
    previousSequenceLengthRef.current = game.sequence.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase, game.sequence.length, game.sequence, handlers])
}

export function GamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const game = useGameStore()
  const handlers = useAppHandlers()

  const handlePlayAgain = () => {
    handlers.feedback.reset()
    game.generateSequence()
  }

  const handleGoToConfig = () => {
    handlers.handlePlayAgain()
    navigate('/config')
  }

  useEffect(() => {
    if (game.phase !== 'playing' && game.phase !== 'complete') {
      navigate('/config')
    }
  }, [game.phase, navigate])

  usePlayAllOnGameStart(game, handlers)

  if (game.phase === 'complete') {
    return renderCompletePhase(game.score, game.sequence.length, handlePlayAgain, handleGoToConfig)
  }

  if (game.phase !== 'playing') {
    return null
  }

  return renderPlayingPhase(game, handlers, navigate, t)
}
