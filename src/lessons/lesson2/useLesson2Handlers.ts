import { useLesson2Store } from './lesson2Store'
import { useSettingsStore } from '../../store/settingsStore'
import { useLesson2Audio } from './useLesson2Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { createLesson2AnswerHandler } from './useLesson2AnswerHandler'
import { preloadGuitarSampler } from '../../utils/audioEngines'
import {
  getTimedNotesFromSequence,
  extractTimedNotesFromMultiVoice,
  extractAllNotesFromMultiVoice,
} from '../../utils/sequenceHelpers'
import type { InstrumentType } from '../../types/music'

function createPlayAllHandler(audio: ReturnType<typeof useLesson2Audio>) {
  return () => {
    const state = useLesson2Store.getState()
    const bpm = useSettingsStore.getState().playbackBpm
    const timedGroups = getTimedNotesFromSequence(state.sequence)
    audio.playTimedSequence(timedGroups, bpm, 0, 3)
  }
}

function createPlayCurrentNoteHandler(audio: ReturnType<typeof useLesson2Audio>) {
  return async () => {
    const state = useLesson2Store.getState()
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

function createPlayMeasureHandler(audio: ReturnType<typeof useLesson2Audio>) {
  return (measureIndex: number) => {
    const state = useLesson2Store.getState()
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
    useLesson2Store.getState().generateSequence()
  }
}

function createChangeInstrumentHandler() {
  return (instrument: InstrumentType) => {
    useSettingsStore.getState().setInstrument(instrument)
    if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
      preloadGuitarSampler()
    }
  }
}

export function useLesson2Handlers() {
  const game = useLesson2Store()
  const audio = useLesson2Audio()
  const feedback = useAnswerFeedback()

  return {
    game: { state: game },
    audio,
    feedback,
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handlePlayMeasure: createPlayMeasureHandler(audio),
    handleAnswerSelect: createLesson2AnswerHandler(game, audio, feedback),
    handleGenerate: createGenerateHandler(feedback),
    handleChangeInstrument: createChangeInstrumentHandler(),
  }
}
