import { useLesson4Store } from './lesson4Store'
import { useSettingsStore } from '../../store/settingsStore'
import { useLesson4Audio } from './useLesson4Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { createLesson4AnswerHandler } from './useLesson4AnswerHandler'
import { preloadGuitarSampler } from '../../utils/audioEngines'
import { getNoteDefinitionsFromSequence } from '../common/lessonHelpers'
import type { InstrumentType } from '../../types/music'

function createPlayAllHandler(audio: ReturnType<typeof useLesson4Audio>) {
  return () => {
    const state = useLesson4Store.getState()
    const bpm = useSettingsStore.getState().playbackBpm
    const noteDefinitions = getNoteDefinitionsFromSequence(state.sequence)
    audio.playSequence(noteDefinitions, bpm)
  }
}

function createPlayCurrentNoteHandler(audio: ReturnType<typeof useLesson4Audio>) {
  return async () => {
    const state = useLesson4Store.getState()
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

function createPlayMeasureHandler(audio: ReturnType<typeof useLesson4Audio>) {
  return (measureIndex: number) => {
    const state = useLesson4Store.getState()
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
    useLesson4Store.getState().generateSequence()
  }
}

function createChangeInstrumentHandler() {
  return (instrument: InstrumentType) => {
    useLesson4Store.getState().setConfig({ instrument })
    useSettingsStore.getState().setInstrument(instrument)
    if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
      preloadGuitarSampler()
    }
  }
}

export function useLesson4Handlers() {
  const game = useLesson4Store()
  const audio = useLesson4Audio()
  const feedback = useAnswerFeedback()

  return {
    game: { state: game },
    audio,
    feedback,
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handlePlayMeasure: createPlayMeasureHandler(audio),
    handleAnswerSelect: createLesson4AnswerHandler(game, audio, feedback),
    handleGenerate: createGenerateHandler(feedback),
    handleChangeInstrument: createChangeInstrumentHandler(),
  }
}
