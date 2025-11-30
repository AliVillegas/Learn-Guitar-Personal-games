import type { SolfegeNote, MeasureCount, GuitarString } from '../types/music'
import type { InstrumentType } from '../types/audio'
import { useGameStore } from '../store/gameStore'
import { useSettingsStore } from '../store/settingsStore'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'
import { createAnswerHandler } from './useAnswerHandler'
import { preloadGuitarSampler } from '../utils/audioEngines'

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
    useSettingsStore.getState().setStringNotes(updatedStringNotes)
  }
}

function createChangeMeasureHandler() {
  return (count: MeasureCount) => {
    useGameStore.getState().setConfig({ measureCount: count })
    useSettingsStore.getState().setMeasureCount(count)
  }
}

function createChangeInstrumentHandler() {
  return (instrument: InstrumentType) => {
    useGameStore.getState().setConfig({ instrument })
    useSettingsStore.getState().setInstrument(instrument)
    if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
      preloadGuitarSampler()
    }
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
  return async () => {
    const state = useGameStore.getState()
    const currentNote = state.sequence[state.currentIndex]
    if (currentNote) {
      try {
        await audio.playNote(currentNote.note)
      } catch (error) {
        console.error('Error playing current note:', error)
      }
    }
  }
}

function createPlayMeasureHandler(audio: ReturnType<typeof useAudio>) {
  return (measureIndex: number) => {
    const state = useGameStore.getState()
    const notesPerMeasure = 4
    const startIndex = measureIndex * notesPerMeasure
    const endIndex = startIndex + notesPerMeasure
    const measureNotes = state.sequence.slice(startIndex, endIndex).map((gn) => gn.note)
    audio.playSequence(measureNotes, undefined, startIndex)
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
    handleChangeInstrument: createChangeInstrumentHandler(),
    handleGenerate: createGenerateHandler(feedback),
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handlePlayMeasure: createPlayMeasureHandler(audio),
    handleAnswerSelect: createAnswerHandler(game, audio, feedback),
    handlePlayAgain: createPlayAgainHandler(),
  }
}
