import type { SolfegeNote, MeasureCount, GuitarString } from '../types/music'
import { useGameStore } from '../store/gameStore'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'
import { createAnswerHandler } from './useAnswerHandler'

function createToggleStringNoteHandler() {
  return (guitarString: GuitarString, note: SolfegeNote) => {
    const currentStringNotes = useGameStore.getState().config.stringNotes
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

    useGameStore.getState().setConfig({ stringNotes: updatedStringNotes })
  }
}

function createChangeMeasureHandler() {
  return (count: MeasureCount) => {
    useGameStore.getState().setConfig({ measureCount: count })
  }
}

function createGenerateHandler(feedback: ReturnType<typeof useAnswerFeedback>) {
  return () => {
    feedback.reset()
    useGameStore.getState().generateSequence()
  }
}

function createPlayAllHandler(audio: ReturnType<typeof useAudio>) {
  return () => {
    const sequence = useGameStore.getState().sequence
    const noteDefinitions = sequence.map((gn) => gn.note)
    audio.playSequence(noteDefinitions)
  }
}

function createPlayCurrentNoteHandler(audio: ReturnType<typeof useAudio>) {
  return () => {
    const state = useGameStore.getState()
    const currentNote = state.sequence[state.currentIndex]
    if (currentNote) {
      audio.playNote(currentNote.note)
    }
  }
}

function createPlayAgainHandler() {
  return () => {
    useGameStore.getState().reset()
  }
}

export function useAppHandlers() {
  const game = useGameStore()
  const audio = useAudio()
  const feedback = useAnswerFeedback()

  return {
    game: { state: game },
    audio,
    feedback,
    handleToggleStringNote: createToggleStringNoteHandler(),
    handleChangeMeasure: createChangeMeasureHandler(),
    handleGenerate: createGenerateHandler(feedback),
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handleAnswerSelect: createAnswerHandler(game, audio, feedback),
    handlePlayAgain: createPlayAgainHandler(),
  }
}
