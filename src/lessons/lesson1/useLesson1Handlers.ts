import { useLesson1Store } from './lesson1Store'
import { useSettingsStore } from '../../store/settingsStore'
import { useLesson1Audio } from './useLesson1Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { createLesson1AnswerHandler } from './useLesson1AnswerHandler'
import { preloadGuitarSampler } from '../../utils/audioEngines'
import { getNoteDefinitionsFromSequence } from '../common/lessonHelpers'
import type { InstrumentType } from '../../types/music'

function createPlayAllHandler(audio: ReturnType<typeof useLesson1Audio>) {
  return () => {
    const state = useLesson1Store.getState()
    const bpm = useSettingsStore.getState().playbackBpm
    const noteDefinitions = getNoteDefinitionsFromSequence(state.sequence)
    audio.playSequence(noteDefinitions, bpm)
  }
}

function createPlayCurrentNoteHandler(audio: ReturnType<typeof useLesson1Audio>) {
  return async () => {
    const state = useLesson1Store.getState()
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

function createPlayMeasureHandler(audio: ReturnType<typeof useLesson1Audio>) {
  return (measureIndex: number) => {
    const state = useLesson1Store.getState()
    const bpm = useSettingsStore.getState().playbackBpm
    const notesPerMeasure = 4
    const startIndex = measureIndex * notesPerMeasure
    const endIndex = startIndex + notesPerMeasure
    const measureItems = state.sequence.slice(startIndex, endIndex)
    const measureNotes = getNoteDefinitionsFromSequence(measureItems)
    audio.playSequence(measureNotes, bpm, startIndex)
  }
}

function createGenerateHandler(feedback: ReturnType<typeof useAnswerFeedback>) {
  return () => {
    feedback.reset()
    useLesson1Store.getState().generateSequence()
  }
}

function createChangeInstrumentHandler() {
  return (instrument: InstrumentType) => {
    useLesson1Store.getState().setConfig({ instrument })
    useSettingsStore.getState().setInstrument(instrument)
    if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
      preloadGuitarSampler()
    }
  }
}

export function useLesson1Handlers() {
  const game = useLesson1Store()
  const audio = useLesson1Audio()
  const feedback = useAnswerFeedback()

  return {
    game: { state: game },
    audio,
    feedback,
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handlePlayMeasure: createPlayMeasureHandler(audio),
    handleAnswerSelect: createLesson1AnswerHandler(game, audio, feedback),
    handleGenerate: createGenerateHandler(feedback),
    handleChangeInstrument: createChangeInstrumentHandler(),
  }
}
