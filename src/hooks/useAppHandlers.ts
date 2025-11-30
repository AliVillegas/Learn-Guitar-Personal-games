import type { SolfegeNote, MeasureCount } from '../types/music'
import { useGameState } from './useGameState'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'
import { createAnswerHandler } from './useAnswerHandler'

function createToggleNoteHandler(game: ReturnType<typeof useGameState>) {
  return (note: SolfegeNote) => {
    const current = game.state.config.selectedNotes
    const isSelected = current.includes(note)
    const newSelection = isSelected
      ? current.filter((n) => n !== note)
      : [...current, note]
    game.setConfig({ selectedNotes: newSelection })
  }
}

function createChangeMeasureHandler(game: ReturnType<typeof useGameState>) {
  return (count: MeasureCount) => {
    game.setConfig({ measureCount: count })
  }
}

export function useAppHandlers() {
  const game = useGameState()
  const audio = useAudio()
  const feedback = useAnswerFeedback()

  const handleToggleNote = createToggleNoteHandler(game)
  const handleChangeMeasure = createChangeMeasureHandler(game)

  const handleGenerate = () => {
    feedback.reset()
    game.generateSequence()
  }

  const handlePlayAll = () => {
    const noteDefinitions = game.state.sequence.map((gn) => gn.note)
    audio.playSequence(noteDefinitions)
  }

  const handleAnswerSelect = createAnswerHandler(game, audio, feedback)

  const handlePlayAgain = () => {
    game.reset()
  }

  return {
    game,
    audio,
    feedback,
    handleToggleNote,
    handleChangeMeasure,
    handleGenerate,
    handlePlayAll,
    handleAnswerSelect,
    handlePlayAgain,
  }
}

