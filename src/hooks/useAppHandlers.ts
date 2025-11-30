import type { SolfegeNote, MeasureCount, GuitarString } from '../types/music'
import { useGameState } from './useGameState'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'
import { createAnswerHandler } from './useAnswerHandler'

function createToggleNoteHandler(game: ReturnType<typeof useGameState>) {
  return (note: SolfegeNote) => {
    const current = game.state.config.selectedNotes
    const isSelected = current.includes(note)
    const newSelection = isSelected ? current.filter((n) => n !== note) : [...current, note]
    game.setConfig({ selectedNotes: newSelection })
  }
}

function createToggleStringHandler(game: ReturnType<typeof useGameState>) {
  return (guitarString: GuitarString) => {
    const current = game.state.config.selectedStrings
    const isSelected = current.includes(guitarString)
    const newSelection = isSelected
      ? current.filter((s) => s !== guitarString)
      : [...current, guitarString]
    game.setConfig({ selectedStrings: newSelection })
  }
}

function createChangeMeasureHandler(game: ReturnType<typeof useGameState>) {
  return (count: MeasureCount) => {
    game.setConfig({ measureCount: count })
  }
}

function createGenerateHandler(
  feedback: ReturnType<typeof useAnswerFeedback>,
  game: ReturnType<typeof useGameState>
) {
  return () => {
    feedback.reset()
    game.generateSequence()
  }
}

function createPlayAllHandler(
  game: ReturnType<typeof useGameState>,
  audio: ReturnType<typeof useAudio>
) {
  return () => {
    const noteDefinitions = game.state.sequence.map((gn) => gn.note)
    audio.playSequence(noteDefinitions)
  }
}

function createPlayCurrentNoteHandler(
  game: ReturnType<typeof useGameState>,
  audio: ReturnType<typeof useAudio>
) {
  return () => {
    const currentNote = game.state.sequence[game.state.currentIndex]
    if (currentNote) {
      audio.playNote(currentNote.note)
    }
  }
}

function createPlayAgainHandler(game: ReturnType<typeof useGameState>) {
  return () => {
    game.reset()
  }
}

export function useAppHandlers() {
  const game = useGameState()
  const audio = useAudio()
  const feedback = useAnswerFeedback()

  return {
    game,
    audio,
    feedback,
    handleToggleNote: createToggleNoteHandler(game),
    handleToggleString: createToggleStringHandler(game),
    handleChangeMeasure: createChangeMeasureHandler(game),
    handleGenerate: createGenerateHandler(feedback, game),
    handlePlayAll: createPlayAllHandler(game, audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(game, audio),
    handleAnswerSelect: createAnswerHandler(game, audio, feedback),
    handlePlayAgain: createPlayAgainHandler(game),
  }
}
