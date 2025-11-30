import type { SolfegeNote, MeasureCount, GuitarString } from '../types/music'
import { useGameState } from './useGameState'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'
import { createAnswerHandler } from './useAnswerHandler'

function createToggleStringNoteHandler(game: ReturnType<typeof useGameState>) {
  return (guitarString: GuitarString, note: SolfegeNote) => {
    const currentStringNotes = game.state.config.stringNotes
    const stringConfig = currentStringNotes.find((sn) => sn.string === guitarString)

    if (!stringConfig) {
      return
    }

    const isSelected = stringConfig.notes.includes(note)
    const newNotes = isSelected
      ? stringConfig.notes.filter((n) => n !== note)
      : [...stringConfig.notes, note]

    const updatedStringNotes = currentStringNotes.map((sn) =>
      sn.string === guitarString ? { ...sn, notes: newNotes } : sn
    )

    game.setConfig({ stringNotes: updatedStringNotes })
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
    handleToggleStringNote: createToggleStringNoteHandler(game),
    handleChangeMeasure: createChangeMeasureHandler(game),
    handleGenerate: createGenerateHandler(feedback, game),
    handlePlayAll: createPlayAllHandler(game, audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(game, audio),
    handleAnswerSelect: createAnswerHandler(game, audio, feedback),
    handlePlayAgain: createPlayAgainHandler(game),
  }
}
