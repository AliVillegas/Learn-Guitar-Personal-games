import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Staff } from '../components/Staff/Staff'
import { PlaybackControls } from '../components/PlaybackControls/PlaybackControls'
import { AnswerSection } from '../components/PlayPanel/AnswerSection'
import { ScoreDisplay } from '../components/ScoreDisplay/ScoreDisplay'
import { ResultPanel } from '../components/ResultPanel/ResultPanel'
import { BpmControl } from '../components/BpmControl/BpmControl'
import { Button } from '../components/ui/button'
import { useGameStore } from '../store/gameStore'
import { useSettingsStore } from '../store/settingsStore'
import { useAppHandlers } from '../hooks/useAppHandlers'
import { preloadGuitarSampler } from '../utils/audioEngines'
import type { MeasureCount, NoteDefinition } from '../types/music'

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

type GameState = ReturnType<typeof useGameStore>
type Handlers = ReturnType<typeof useAppHandlers>

function renderAnswerSection(handlers: Handlers) {
  return (
    <AnswerSection
      isPlayingAudio={handlers.audio.isPlaying}
      feedbackState={handlers.feedback.feedbackState}
      onAnswerSelect={handlers.handleAnswerSelect}
    />
  )
}

function renderPlaybackSection(
  game: GameState,
  handlers: Handlers,
  noteDefinitions: NoteDefinition[]
) {
  return (
    <PlaybackControls
      notes={noteDefinitions}
      currentNote={getCurrentNote(game.sequence, game.currentIndex)}
      measureCount={game.config.measureCount}
      onPlayAll={handlers.handlePlayAll}
      onPlayCurrentNote={handlers.handlePlayCurrentNote}
      onPlayMeasure={handlers.handlePlayMeasure}
      isPlaying={handlers.audio.isPlaying}
    />
  )
}

function renderStaffSection(
  notes: ReturnType<typeof useGameStore>['sequence'],
  measureCount: MeasureCount,
  highlightIndex: number,
  isPlaying: boolean
) {
  return (
    <div className="space-y-2">
      <BpmControl disabled={isPlaying} />
      <Staff notes={notes} measureCount={measureCount} currentIndex={highlightIndex} />
    </div>
  )
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
  t: (key: string) => string,
  isPlaying: boolean
) {
  return (
    <div className="flex justify-between items-center">
      <Button onClick={() => navigate('/config')} variant="ghost" disabled={isPlaying}>
        {t('game.backToConfig')}
      </Button>
      <Button onClick={onRegenerate} variant="secondary" disabled={isPlaying}>
        {t('game.regenerate')}
      </Button>
    </div>
  )
}

function renderGameContent(
  game: GameState,
  handlers: Handlers,
  highlightIndex: number,
  noteDefinitions: NoteDefinition[]
) {
  return (
    <>
      {renderStaffSection(
        game.sequence,
        game.config.measureCount,
        highlightIndex,
        handlers.audio.isPlaying
      )}
      {renderPlaybackSection(game, handlers, noteDefinitions)}
      {renderAnswerSection(handlers)}
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
      {renderGameButtons(navigate, handleRegenerate, t, handlers.audio.isPlaying)}
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

function usePreloadAudioOnGameStart(gamePhase: string) {
  const hasPreloadedRef = useRef(false)

  useEffect(() => {
    if (gamePhase === 'playing' && !hasPreloadedRef.current) {
      hasPreloadedRef.current = true
      preloadGuitarSampler().catch((error) => {
        console.error('Error preloading audio:', error)
      })
    }
  }, [gamePhase])
}

function usePlayAllOnGameStart(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  autoPlayOnGenerate: boolean
) {
  const previousSequenceLengthRef = useRef<number>(0)

  useEffect(() => {
    const shouldPlay =
      autoPlayOnGenerate && isNewSequenceGenerated(game, previousSequenceLengthRef.current)

    if (shouldPlay) {
      const noteDefinitions = game.sequence.map((gn) => gn.note)
      playAllNotes(handlers, noteDefinitions)
    }
    previousSequenceLengthRef.current = game.sequence.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase, game.sequence.length, game.sequence, handlers, autoPlayOnGenerate])
}

export function GamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const game = useGameStore()
  const autoPlayOnGenerate = useSettingsStore((state) => state.autoPlayOnGenerate)
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

  usePreloadAudioOnGameStart(game.phase)
  usePlayAllOnGameStart(game, handlers, autoPlayOnGenerate)

  if (game.phase === 'complete') {
    return renderCompletePhase(game.score, game.sequence.length, handlePlayAgain, handleGoToConfig)
  }

  if (game.phase !== 'playing') {
    return null
  }

  return renderPlayingPhase(game, handlers, navigate, t)
}
