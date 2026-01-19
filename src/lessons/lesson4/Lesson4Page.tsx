import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLesson4Store } from './lesson4Store'
import { useLesson4Handlers } from './useLesson4Handlers'
import { LessonRenderer, ResultRenderer } from '../common/LessonRenderer'
import { Lesson4Config } from './Lesson4Config'
import { getNoteDefinitionsFromSequence } from '../common/lessonHelpers'
import { preloadGuitarSampler } from '../../utils/audioEngines'
import { useSettingsStore } from '../../store/settingsStore'

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

function useConfigSync(game: ReturnType<typeof useLesson4Store>) {
  useEffect(() => {
    const syncConfig = () => {
      const settings = useSettingsStore.getState()
      const currentConfig = game.config

      if (JSON.stringify(currentConfig.stringNotes) !== JSON.stringify(settings.stringNotes)) {
        game.setConfig({ stringNotes: settings.stringNotes })
      }
      if (currentConfig.instrument !== settings.instrument) {
        game.setConfig({ instrument: settings.instrument })
      }
    }

    syncConfig()
    const unsubscribe = useSettingsStore.subscribe(syncConfig)
    return unsubscribe
  }, [game])
}

function renderCompletePhase(
  score: ReturnType<typeof useLesson4Store>['score'],
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
  game: ReturnType<typeof useLesson4Store>,
  handlers: ReturnType<typeof useLesson4Handlers>,
  highlightIndex: number,
  noteDefinitions: ReturnType<typeof getNoteDefinitionsFromSequence>,
  handleRegenerate: () => void,
  handleGoToHome: () => void
) {
  return (
    <LessonRenderer
      sequence={game.sequence}
      measureCount={4}
      currentIndex={game.currentIndex}
      highlightIndex={highlightIndex}
      isPlaying={handlers.audio.isPlaying}
      noteDefinitions={noteDefinitions}
      showAnswerSection={true}
      showScore={true}
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

function createLesson4Handlers(
  game: ReturnType<typeof useLesson4Store>,
  handlers: ReturnType<typeof useLesson4Handlers>
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

function renderLesson4PlayingPhase(
  game: ReturnType<typeof useLesson4Store>,
  handlers: ReturnType<typeof useLesson4Handlers>,
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

function renderLesson4Phase(
  game: ReturnType<typeof useLesson4Store>,
  handlers: ReturnType<typeof useLesson4Handlers>,
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
    return <Lesson4Config />
  }

  if (game.phase !== 'playing') {
    return null
  }

  return renderLesson4PlayingPhase(game, handlers, handleRegenerate, handleGoToHomeWithNavigate)
}

export function Lesson4Page() {
  const navigate = useNavigate()
  const game = useLesson4Store()
  const handlers = useLesson4Handlers()

  useConfigSync(game)
  usePreloadAudioOnGameStart(game.phase)

  const { handlePlayAgain, handleGoToHome, handleRegenerate } = createLesson4Handlers(
    game,
    handlers
  )

  const handleGoToHomeWithNavigate = () => {
    handleGoToHome()
    navigate('/')
  }

  return renderLesson4Phase(
    game,
    handlers,
    handlePlayAgain,
    handleGoToHomeWithNavigate,
    handleRegenerate
  )
}
