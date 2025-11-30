import { ConfigSection } from '../ConfigSection/ConfigSection'
import { PlayPanel } from '../PlayPanel/PlayPanel'
import { ResultPanel } from '../ResultPanel/ResultPanel'
import type { ReturnType } from 'react'
import { useAppHandlers } from '../../hooks/useAppHandlers'

type Handlers = ReturnType<typeof useAppHandlers>

interface AppContentProps {
  handlers: Handlers
}

function renderConfigPhase(handlers: Handlers) {
  const config = handlers.game.state.config
  return (
    <ConfigSection
      stringNotes={config.stringNotes}
      measureCount={config.measureCount}
      onToggleStringNote={handlers.handleToggleStringNote}
      onChangeMeasure={handlers.handleChangeMeasure}
      onGenerate={handlers.handleGenerate}
    />
  )
}

function renderCompletePhase(handlers: Handlers) {
  const { game } = handlers
  return (
    <ResultPanel
      correct={game.state.score.correct}
      total={game.state.sequence.length}
      onPlayAgain={handlers.handlePlayAgain}
    />
  )
}

function renderPlayingPhase(handlers: Handlers) {
  const { game, audio, feedback } = handlers
  const noteDefinitions = game.state.sequence.map((gn) => gn.note)
  return (
    <PlayPanel
      notes={game.state.sequence}
      measureCount={game.state.config.measureCount}
      currentIndex={game.state.currentIndex}
      noteDefinitions={noteDefinitions}
      isComplete={false}
      isPlayingAudio={audio.isPlaying}
      feedbackState={feedback.feedbackState}
      onPlayAll={handlers.handlePlayAll}
      onPlayCurrentNote={handlers.handlePlayCurrentNote}
      onAnswerSelect={handlers.handleAnswerSelect}
    />
  )
}

export function AppContent({ handlers }: AppContentProps) {
  const phase = handlers.game.state.phase
  if (phase === 'config') return renderConfigPhase(handlers)
  if (phase === 'complete') return renderCompletePhase(handlers)
  if (phase === 'playing') return renderPlayingPhase(handlers)
  return null
}
