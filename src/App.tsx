import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher'
import { ConfigSection } from './components/ConfigSection/ConfigSection'
import { PlayPanel } from './components/PlayPanel/PlayPanel'
import { ResultPanel } from './components/ResultPanel/ResultPanel'
import { useAppHandlers } from './hooks/useAppHandlers'
import './App.css'

function App() {
  const { t } = useTranslation()
  const {
    game,
    audio,
    feedback,
    handleToggleNote,
    handleChangeMeasure,
    handleGenerate,
    handlePlayAll,
    handleAnswerSelect,
    handlePlayAgain,
  } = useAppHandlers()

  const isPlaying = game.state.phase === 'playing' || game.state.phase === 'complete'
  const isComplete = game.state.phase === 'complete'
  const noteDefinitions = game.state.sequence.map((gn) => gn.note)

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <LanguageSwitcher />
      </header>

      <main className="app-main">
        {game.state.phase === 'config' && (
          <ConfigSection
            selectedNotes={game.state.config.selectedNotes}
            measureCount={game.state.config.measureCount}
            onToggleNote={handleToggleNote}
            onChangeMeasure={handleChangeMeasure}
            onGenerate={handleGenerate}
          />
        )}

        {isPlaying && (
          <PlayPanel
            notes={game.state.sequence}
            measureCount={game.state.config.measureCount}
            currentIndex={game.state.currentIndex}
            noteDefinitions={noteDefinitions}
            isComplete={isComplete}
            isPlayingAudio={audio.isPlaying}
            feedbackState={feedback.feedbackState}
            onPlayAll={handlePlayAll}
            onAnswerSelect={handleAnswerSelect}
          />
        )}

        {isComplete && (
          <ResultPanel
            correct={game.state.score.correct}
            total={game.state.sequence.length}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>
    </div>
  )
}

export default App
