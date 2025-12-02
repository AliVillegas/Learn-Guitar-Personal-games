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

function playFirstNote(
  handlers: ReturnType<typeof useAppHandlers>,
  firstNote: ReturnType<typeof useGameStore>['sequence'][0]
) {
  if (firstNote) {
    handlers.audio.playNote(firstNote.note).catch((error) => {
      console.error('Error playing first note:', error)
    })
  }
}

function handleInitialMount(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  previousSequenceLengthRef: React.MutableRefObject<number>
) {
  previousSequenceLengthRef.current = game.sequence.length
  if (game.phase === 'playing' && game.currentIndex === 0 && game.sequence.length > 0) {
    playFirstNote(handlers, game.sequence[0])
  }
}

function isNewSequenceGenerated(
  game: ReturnType<typeof useGameStore>,
  previousSequenceLengthRef: React.MutableRefObject<number>
): boolean {
  return (
    game.phase === 'playing' &&
    game.currentIndex === 0 &&
    game.sequence.length > 0 &&
    previousSequenceLengthRef.current !== game.sequence.length
  )
}

function handleSequenceGeneration(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  previousSequenceLengthRef: React.MutableRefObject<number>
): boolean {
  if (isNewSequenceGenerated(game, previousSequenceLengthRef)) {
    playFirstNote(handlers, game.sequence[0])
    previousSequenceLengthRef.current = game.sequence.length
    return true
  }

  if (game.phase === 'playing' && game.currentIndex === 0) {
    previousSequenceLengthRef.current = game.sequence.length
  }

  return false
}

function playFirstNoteOnGeneration(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  previousSequenceLengthRef: React.MutableRefObject<number>,
  isInitialMountRef: React.MutableRefObject<boolean>
) {
  if (isInitialMountRef.current) {
    isInitialMountRef.current = false
    handleInitialMount(game, handlers, previousSequenceLengthRef)
    return true
  }

  return handleSequenceGeneration(game, handlers, previousSequenceLengthRef)
}

const NEXT_NOTE_DELAY_MS = 500

function playDelayedNote(audio: ReturnType<typeof useAppHandlers>['audio'], note: NoteDefinition) {
  audio.playNote(note).catch((error) => {
    console.error('Error playing highlighted note:', error)
  })
}

function useNotePlaybackOnNextHighlight(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  previousIndexRef: React.MutableRefObject<number | null>
) {
  useEffect(() => {
    const shouldPlayNextNote =
      game.phase === 'playing' &&
      previousIndexRef.current !== null &&
      previousIndexRef.current < game.currentIndex

    if (shouldPlayNextNote) {
      const currentNote = game.sequence[game.currentIndex]
      if (currentNote) {
        const timeoutId = setTimeout(
          () => playDelayedNote(handlers.audio, currentNote.note),
          NEXT_NOTE_DELAY_MS
        )
        previousIndexRef.current = game.currentIndex
        return () => clearTimeout(timeoutId)
      }
    }
    previousIndexRef.current = game.currentIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.currentIndex, game.phase, game.sequence, handlers.audio])
}

function useNotePlaybackOnHighlight(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>
) {
  const previousIndexRef = useRef<number | null>(null)
  const previousSequenceLengthRef = useRef<number>(0)
  const isInitialMountRef = useRef<boolean>(true)

  useEffect(() => {
    const shouldResetIndex = playFirstNoteOnGeneration(
      game,
      handlers,
      previousSequenceLengthRef,
      isInitialMountRef
    )
    if (shouldResetIndex) {
      previousIndexRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase, game.currentIndex, game.sequence.length, game.sequence, handlers])

  useNotePlaybackOnNextHighlight(game, handlers, previousIndexRef)
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

  useNotePlaybackOnHighlight(game, handlers)

  if (game.phase === 'complete') {
    return renderCompletePhase(game.score, game.sequence.length, handlePlayAgain, handleGoToConfig)
  }

  if (game.phase !== 'playing') {
    return null
  }

  return renderPlayingPhase(game, handlers, navigate, t)
}
