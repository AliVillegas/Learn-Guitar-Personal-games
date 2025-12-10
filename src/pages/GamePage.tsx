import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { Staff } from '../components/Staff/Staff'
import { PlaybackControls } from '../components/PlaybackControls/PlaybackControls'
import { AnswerSection } from '../components/PlayPanel/AnswerSection'
import { ScoreDisplay } from '../components/ScoreDisplay/ScoreDisplay'
import { ResultPanel } from '../components/ResultPanel/ResultPanel'
import { BpmControl } from '../components/BpmControl/BpmControl'
import { Button } from '../components/ui/button'
import { useGameStore } from '../store/gameStore'
import { useAppHandlers } from '../hooks/useAppHandlers'
import { preloadGuitarSampler } from '../utils/audioEngines'
import { getNoteDefinitionsFromSequence, getCurrentNoteDefinition } from '../utils/sequenceHelpers'
import { getCurrentMeasureCount } from '../store/gameStore'
import type { MeasureCount, MultiVoiceMeasureCount, NoteDefinition } from '../types/music'

function calculateCorrectCount(notes: ReturnType<typeof useGameStore>['sequence']): number {
  return notes.filter((n) => n.status === 'correct').length
}

function getCurrentNote(
  notes: ReturnType<typeof useGameStore>['sequence'],
  currentIndex: number
): NoteDefinition | null {
  const current = notes[currentIndex]
  if (!current) return null
  return getCurrentNoteDefinition(current)
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
  noteDefinitions: NoteDefinition[],
  measureCount: MeasureCount | MultiVoiceMeasureCount
) {
  const isMultiVoice = game.config.lessonType === 'multi-voice'

  return (
    <PlaybackControls
      notes={noteDefinitions}
      currentNote={getCurrentNote(game.sequence, game.currentIndex)}
      measureCount={measureCount}
      onPlayAll={handlers.handlePlayAll}
      onPlayCurrentNote={handlers.handlePlayCurrentNote}
      onPlayMeasure={handlers.handlePlayMeasure}
      isPlaying={handlers.audio.isPlaying}
      showPlayCurrentNote={!isMultiVoice}
    />
  )
}

function renderStaffSection(
  notes: ReturnType<typeof useGameStore>['sequence'],
  measureCount: MeasureCount | MultiVoiceMeasureCount,
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
  onGoToHome: () => void
) {
  return (
    <ResultPanel
      correct={score.correct}
      total={sequenceLength}
      onPlayAgain={onPlayAgain}
      onGoToConfig={onPlayAgain}
      onGoToHome={onGoToHome}
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
      <Button onClick={() => navigate('/')} variant="ghost" disabled={isPlaying}>
        {t('app.backToHome')}
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
  noteDefinitions: NoteDefinition[],
  measureCount: MeasureCount | MultiVoiceMeasureCount
) {
  const isMultiVoice = game.config.lessonType === 'multi-voice'

  return (
    <>
      {renderStaffSection(game.sequence, measureCount, highlightIndex, handlers.audio.isPlaying)}
      {renderPlaybackSection(game, handlers, noteDefinitions, measureCount)}
      {!isMultiVoice && renderAnswerSection(handlers)}
      {!isMultiVoice && renderScoreSection(game.sequence)}
    </>
  )
}

function renderPlayingPhase(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  navigate: (path: string) => void,
  t: (key: string) => string
) {
  const noteDefinitions = getNoteDefinitionsFromSequence(game.sequence)
  const measureCount = getCurrentMeasureCount(game.config)
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
      {renderGameContent(game, handlers, highlightIndex, noteDefinitions, measureCount)}
    </div>
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

function getLessonTypeFromPath(pathname: string): 'single-notes' | 'multi-voice' | null {
  if (pathname.includes('/lesson1')) return 'single-notes'
  if (pathname.includes('/lesson2')) return 'multi-voice'
  return null
}

function useLessonTypeSync(
  lessonType: 'single-notes' | 'multi-voice' | null,
  game: ReturnType<typeof useGameStore>
) {
  useEffect(() => {
    if (lessonType && game.config.lessonType !== lessonType) {
      game.setConfig({ ...game.config, lessonType })
    }
  }, [lessonType, game.config.lessonType])
}

function useAutoGenerateSequence(game: ReturnType<typeof useGameStore>) {
  useEffect(() => {
    if (game.phase === 'config') {
      game.generateSequence()
    }
  }, [game.phase])
}

function createGamePageHandlers(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>
) {
  const handlePlayAgain = () => {
    handlers.feedback.reset()
    game.generateSequence()
  }

  const handleGoToHome = () => {
    handlers.handlePlayAgain()
  }

  return { handlePlayAgain, handleGoToHome }
}

function renderGamePagePhase(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>,
  navigate: (path: string) => void,
  t: (key: string) => string,
  handlePlayAgain: () => void,
  handleGoToHomeWithNavigate: () => void
) {
  if (game.phase === 'complete') {
    return renderCompletePhase(
      game.score,
      game.sequence.length,
      handlePlayAgain,
      handleGoToHomeWithNavigate
    )
  }

  if (game.phase !== 'playing') {
    return null
  }

  return renderPlayingPhase(game, handlers, navigate, t)
}

export function GamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const game = useGameStore()
  const handlers = useAppHandlers()

  const lessonType = getLessonTypeFromPath(location.pathname)

  useLessonTypeSync(lessonType, game)
  useAutoGenerateSequence(game)
  usePreloadAudioOnGameStart(game.phase)

  const { handlePlayAgain, handleGoToHome } = createGamePageHandlers(game, handlers)

  const handleGoToHomeWithNavigate = () => {
    handleGoToHome()
    navigate('/')
  }

  if (!lessonType) {
    navigate('/')
    return null
  }

  return renderGamePagePhase(
    game,
    handlers,
    navigate,
    t,
    handlePlayAgain,
    handleGoToHomeWithNavigate
  )
}
