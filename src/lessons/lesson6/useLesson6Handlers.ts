import { useLesson6Store } from './lesson6Store'
import { useSettingsStore } from '../../store/settingsStore'
import { useLesson6Audio } from './useLesson6Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { createLesson6AnswerHandler } from './useLesson6AnswerHandler'
import { preloadGuitarSampler } from '../../utils/audioEngines'
import {
  getTimedNotesFromSequence,
  extractTimedNotesFromMultiVoice,
  extractAllNotesFromMultiVoice,
} from '../../utils/sequenceHelpers'
import type { InstrumentType } from '../../types/music'

function createPlayAllHandler(audio: ReturnType<typeof useLesson6Audio>) {
  return () => {
    const state = useLesson6Store.getState()
    const bpm = useSettingsStore.getState().playbackBpm
    const timedGroups = getTimedNotesFromSequence(state.sequence)
    audio.playTimedSequence(timedGroups, bpm, 0, 3)
  }
}

function createPlayCurrentNoteHandler(audio: ReturnType<typeof useLesson6Audio>) {
  return async () => {
    const state = useLesson6Store.getState()
    const currentNote = state.sequence[state.currentIndex]
    if (currentNote) {
      try {
        const allNotes = extractAllNotesFromMultiVoice(currentNote)
        const promises = allNotes.map((note) => audio.playNote(note))
        await Promise.all(promises)
      } catch (error) {
        console.error('Error playing current note:', error)
      }
    }
  }
}

function createPlayMeasureHandler(audio: ReturnType<typeof useLesson6Audio>) {
  return (measureIndex: number) => {
    const state = useLesson6Store.getState()
    const bpm = useSettingsStore.getState().playbackBpm
    const measureItem = state.sequence[measureIndex]
    if (measureItem) {
      const timedNotes = extractTimedNotesFromMultiVoice(measureItem)
      audio.playTimedSequence([timedNotes], bpm, measureIndex, 3)
    }
  }
}

function createGenerateHandler(feedback: ReturnType<typeof useAnswerFeedback>) {
  return () => {
    feedback.reset()
    useLesson6Store.getState().generateSequence()
  }
}

function createChangeInstrumentHandler() {
  return (instrument: InstrumentType) => {
    useLesson6Store.getState().setConfig({ instrument })
    useSettingsStore.getState().setInstrument(instrument)
    if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
      preloadGuitarSampler()
    }
  }
}

export function useLesson6Handlers() {
  const game = useLesson6Store()
  const audio = useLesson6Audio()
  const feedback = useAnswerFeedback()

  return {
    game: { state: game },
    audio,
    feedback,
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handlePlayMeasure: createPlayMeasureHandler(audio),
    handleAnswerSelect: createLesson6AnswerHandler(game, audio, feedback),
    handleGenerate: createGenerateHandler(feedback),
    handleChangeInstrument: createChangeInstrumentHandler(),
  }
}
