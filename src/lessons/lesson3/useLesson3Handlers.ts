import { useLesson3Store } from './lesson3Store'
import { useSettingsStore } from '../../store/settingsStore'
import { useLesson3Audio } from './useLesson3Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { createLesson3AnswerHandler } from './useLesson3AnswerHandler'
import { preloadGuitarSampler } from '../../utils/audioEngines'
import { getNoteDefinitionsFromSequence } from '../common/lessonHelpers'
import type { InstrumentType } from '../../types/music'

function createPlayAllHandler(audio: ReturnType<typeof useLesson3Audio>) {
  return () => {
    const state = useLesson3Store.getState()
    const bpm = useSettingsStore.getState().playbackBpm
    const noteDefinitions = getNoteDefinitionsFromSequence(state.sequence)
    audio.playSequence(noteDefinitions, bpm)
  }
}

function createPlayCurrentNoteHandler(audio: ReturnType<typeof useLesson3Audio>) {
  return async () => {
    const state = useLesson3Store.getState()
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

function createPlayMeasureHandler(audio: ReturnType<typeof useLesson3Audio>) {
  return (measureIndex: number) => {
    const state = useLesson3Store.getState()
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
    useLesson3Store.getState().generateSequence()
  }
}

function createChangeInstrumentHandler() {
  return (instrument: InstrumentType) => {
    useLesson3Store.getState().setConfig({ instrument })
    useSettingsStore.getState().setInstrument(instrument)
    if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
      preloadGuitarSampler()
    }
  }
}

export function useLesson3Handlers() {
  const game = useLesson3Store()
  const audio = useLesson3Audio()
  const feedback = useAnswerFeedback()

  return {
    game: { state: game },
    audio,
    feedback,
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handlePlayMeasure: createPlayMeasureHandler(audio),
    handleAnswerSelect: createLesson3AnswerHandler(game, audio, feedback),
    handleGenerate: createGenerateHandler(feedback),
    handleChangeInstrument: createChangeInstrumentHandler(),
  }
}
