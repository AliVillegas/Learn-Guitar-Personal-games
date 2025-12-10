import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLesson2Store } from './lesson2Store'
import { useLesson2Handlers } from './useLesson2Handlers'
import { LessonRenderer, ResultRenderer } from '../common/LessonRenderer'
import { Lesson2Config } from './Lesson2Config'
import { getNoteDefinitionsFromSequence } from '../common/lessonHelpers'
import { preloadGuitarSampler } from '../../utils/audioEngines'

function getHighlightIndex(
  isPlayingAudio: boolean,
  playingIndex: number | null,
  currentIndex: number
): number {
  return isPlayingAudio && playingIndex !== null ? playingIndex : currentIndex
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

function renderCompletePhase(
  score: ReturnType<typeof useLesson2Store>['score'],
  sequenceLength: number,
  onPlayAgain: () => void,
  onGoToHome: () => void
) {
  return (
    <ResultRenderer
      correct={score.correct}
      total={sequenceLength}
      onPlayAgain={onPlayAgain}
      onGoToHome={onGoToHome}
    />
  )
}

function renderPlayingPhase(
  game: ReturnType<typeof useLesson2Store>,
  handlers: ReturnType<typeof useLesson2Handlers>,
  highlightIndex: number,
  noteDefinitions: ReturnType<typeof getNoteDefinitionsFromSequence>,
  handleRegenerate: () => void,
  handleGoToHome: () => void
) {
  return (
    <LessonRenderer
      sequence={game.sequence}
      measureCount={game.config.measureCount}
      currentIndex={game.currentIndex}
      highlightIndex={highlightIndex}
      isPlaying={handlers.audio.isPlaying}
      noteDefinitions={noteDefinitions}
      showAnswerSection={false}
      showScore={false}
      feedbackState={handlers.feedback.feedbackState}
      onAnswerSelect={handlers.handleAnswerSelect}
      onPlayAll={() => handlers.handlePlayAll()}
      onPlayCurrentNote={handlers.handlePlayCurrentNote}
      onPlayMeasure={handlers.handlePlayMeasure}
      onRegenerate={handleRegenerate}
      onGoToHome={handleGoToHome}
    />
  )
}

function createLesson2Handlers(
  game: ReturnType<typeof useLesson2Store>,
  handlers: ReturnType<typeof useLesson2Handlers>
) {
  const handlePlayAgain = () => {
    handlers.feedback.reset()
    game.generateSequence()
  }

  const handleGoToHome = () => {
    handlers.feedback.reset()
    game.reset()
  }

  const handleRegenerate = () => {
    handlers.feedback.reset()
    game.generateSequence()
  }

  return { handlePlayAgain, handleGoToHome, handleRegenerate }
}

function renderLesson2PlayingPhase(
  game: ReturnType<typeof useLesson2Store>,
  handlers: ReturnType<typeof useLesson2Handlers>,
  handleRegenerate: () => void,
  handleGoToHomeWithNavigate: () => void
) {
  const noteDefinitions = getNoteDefinitionsFromSequence(game.sequence)
  const highlightIndex = getHighlightIndex(
    handlers.audio.isPlaying,
    handlers.audio.playingIndex,
    game.currentIndex
  )

  return renderPlayingPhase(
    game,
    handlers,
    highlightIndex,
    noteDefinitions,
    handleRegenerate,
    handleGoToHomeWithNavigate
  )
}

function renderLesson2Phase(
  game: ReturnType<typeof useLesson2Store>,
  handlers: ReturnType<typeof useLesson2Handlers>,
  handlePlayAgain: () => void,
  handleGoToHomeWithNavigate: () => void,
  handleRegenerate: () => void
) {
  if (game.phase === 'complete') {
    return renderCompletePhase(
      game.score,
      game.sequence.length,
      handlePlayAgain,
      handleGoToHomeWithNavigate
    )
  }

  if (game.phase === 'config') {
    return <Lesson2Config />
  }

  if (game.phase !== 'playing') {
    return null
  }

  return renderLesson2PlayingPhase(game, handlers, handleRegenerate, handleGoToHomeWithNavigate)
}

export function Lesson2Page() {
  const navigate = useNavigate()
  const game = useLesson2Store()
  const handlers = useLesson2Handlers()

  usePreloadAudioOnGameStart(game.phase)

  const { handlePlayAgain, handleGoToHome, handleRegenerate } = createLesson2Handlers(
    game,
    handlers
  )

  const handleGoToHomeWithNavigate = () => {
    handleGoToHome()
    navigate('/')
  }

  return renderLesson2Phase(
    game,
    handlers,
    handlePlayAgain,
    handleGoToHomeWithNavigate,
    handleRegenerate
  )
}
