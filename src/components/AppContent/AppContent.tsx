import { ConfigSection } from '../ConfigSection/ConfigSection'
import { PlayPanel } from '../PlayPanel/PlayPanel'
import { ResultPanel } from '../ResultPanel/ResultPanel'
import { useGameStore } from '../../store/gameStore'
import { useAppHandlers } from '../../hooks/useAppHandlers'

function renderConfig(
  config: ReturnType<typeof useGameStore>['config'],
  handlers: ReturnType<typeof useAppHandlers>
) {
  return (
    <ConfigSection
      stringNotes={config.stringNotes}
      measureCount={config.measureCount}
      instrument={config.instrument}
      onToggleStringNote={handlers.handleToggleStringNote}
      onChangeMeasure={handlers.handleChangeMeasure}
      onChangeInstrument={handlers.handleChangeInstrument}
      onGenerate={handlers.handleGenerate}
    />
  )
}

function renderComplete(
  score: ReturnType<typeof useGameStore>['score'],
  sequenceLength: number,
  handlers: ReturnType<typeof useAppHandlers>
) {
  return (
    <ResultPanel
      correct={score.correct}
      total={sequenceLength}
      onPlayAgain={handlers.handlePlayAgain}
    />
  )
}

function renderPlaying(
  game: ReturnType<typeof useGameStore>,
  handlers: ReturnType<typeof useAppHandlers>
) {
  const noteDefinitions = game.sequence.map((gn) => gn.note)
  return (
    <PlayPanel
      notes={game.sequence}
      measureCount={game.config.measureCount}
      currentIndex={game.currentIndex}
      noteDefinitions={noteDefinitions}
      isComplete={false}
      isPlayingAudio={handlers.audio.isPlaying}
      feedbackState={handlers.feedback.feedbackState}
      onPlayAll={handlers.handlePlayAll}
      onPlayCurrentNote={handlers.handlePlayCurrentNote}
      onAnswerSelect={handlers.handleAnswerSelect}
      playingIndex={handlers.audio.playingIndex}
    />
  )
}

export function AppContent() {
  const phase = useGameStore((state) => state.phase)
  const config = useGameStore((state) => state.config)
  const score = useGameStore((state) => state.score)
  const sequence = useGameStore((state) => state.sequence)
  const game = useGameStore()
  const handlers = useAppHandlers()

  if (phase === 'config') return renderConfig(config, handlers)
  if (phase === 'complete') return renderComplete(score, sequence.length, handlers)
  if (phase === 'playing') return renderPlaying(game, handlers)
  return null
}
