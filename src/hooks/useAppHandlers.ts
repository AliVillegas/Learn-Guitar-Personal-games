import type { SolfegeNote, MeasureCount, GuitarString, MultiVoiceGameNote } from '../types/music'
import type { InstrumentType } from '../types/audio'
import type { GameConfig, StringNoteConfig } from '../types/game'
import { useGameStore } from '../store/gameStore'
import { useSettingsStore } from '../store/settingsStore'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'
import { createAnswerHandler } from './useAnswerHandler'
import { preloadGuitarSampler } from '../utils/audioEngines'
import {
  getNoteDefinitionsFromSequence,
  getTimedNotesFromSequence,
  extractTimedNotesFromMultiVoice,
  extractAllNotesFromMultiVoice,
  isMultiVoiceNote,
} from '../utils/sequenceHelpers'

function getCurrentStringNotes(config: GameConfig) {
  return config.lessonType === 'multi-voice'
    ? config.multiVoice.stringNotes
    : config.singleNotes.stringNotes
}

function updateStringNoteInConfig(
  config: GameConfig,
  updatedStringNotes: StringNoteConfig[]
): Partial<GameConfig> {
  if (config.lessonType === 'multi-voice') {
    return {
      ...config,
      multiVoice: {
        ...config.multiVoice,
        stringNotes: updatedStringNotes,
      },
    }
  }
  return {
    ...config,
    singleNotes: {
      ...config.singleNotes,
      stringNotes: updatedStringNotes,
    },
  }
}

function toggleStringNote(
  stringNotes: StringNoteConfig[],
  guitarString: GuitarString,
  note: SolfegeNote
): StringNoteConfig[] {
  return stringNotes.map((sn) =>
    sn.string === guitarString
      ? {
          ...sn,
          notes: sn.notes.includes(note) ? sn.notes.filter((n) => n !== note) : [...sn.notes, note],
        }
      : sn
  )
}

function createToggleStringNoteHandler() {
  return (guitarString: GuitarString, note: SolfegeNote) => {
    const state = useGameStore.getState()
    const config = state.config
    const currentStringNotes = getCurrentStringNotes(config)
    const stringConfig = currentStringNotes.find((sn) => sn.string === guitarString)

    if (!stringConfig) {
      return
    }

    const updatedStringNotes = toggleStringNote(currentStringNotes, guitarString, note)
    state.setConfig(updateStringNoteInConfig(config, updatedStringNotes))
    useSettingsStore.getState().setStringNotes(updatedStringNotes)
  }
}

function updateMeasureInConfig(config: GameConfig, count: MeasureCount): Partial<GameConfig> {
  if (config.lessonType === 'multi-voice') {
    return {
      ...config,
      multiVoice: {
        ...config.multiVoice,
        measureCount: count as 4 | 5 | 6 | 7 | 8,
      },
    }
  }
  return {
    ...config,
    singleNotes: {
      ...config.singleNotes,
      measureCount: count,
    },
  }
}

function createChangeMeasureHandler() {
  return (count: MeasureCount) => {
    const state = useGameStore.getState()
    state.setConfig(updateMeasureInConfig(state.config, count))
    useSettingsStore.getState().setMeasureCount(count)
  }
}

function updateInstrumentInConfig(
  config: GameConfig,
  instrument: InstrumentType
): Partial<GameConfig> {
  if (config.lessonType === 'multi-voice') {
    return {
      ...config,
      multiVoice: {
        ...config.multiVoice,
        instrument,
      },
    }
  }
  return {
    ...config,
    singleNotes: {
      ...config.singleNotes,
      instrument,
    },
  }
}

function createChangeInstrumentHandler() {
  return (instrument: InstrumentType) => {
    const state = useGameStore.getState()
    state.setConfig(updateInstrumentInConfig(state.config, instrument))
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
    const state = useGameStore.getState()
    const bpm = useSettingsStore.getState().playbackBpm

    if (state.config.lessonType === 'multi-voice') {
      const timedGroups = getTimedNotesFromSequence(state.sequence)
      audio.playTimedSequence(timedGroups, bpm)
    } else {
      const noteDefinitions = getNoteDefinitionsFromSequence(state.sequence)
      audio.playSequence(noteDefinitions, bpm)
    }
  }
}

function playMultiVoiceNote(
  currentNote: MultiVoiceGameNote,
  audio: ReturnType<typeof useAudio>
): Promise<void> {
  const allNotes = extractAllNotesFromMultiVoice(currentNote)
  const promises = allNotes.map((note) => audio.playNote(note))
  return Promise.all(promises).then(() => undefined)
}

function createPlayCurrentNoteHandler(audio: ReturnType<typeof useAudio>) {
  return async () => {
    const state = useGameStore.getState()
    const currentNote = state.sequence[state.currentIndex]
    if (!currentNote) return

    try {
      if (isMultiVoiceNote(currentNote)) {
        await playMultiVoiceNote(currentNote, audio)
      } else {
        await audio.playNote(currentNote.note)
      }
    } catch (error) {
      console.error('Error playing current note:', error)
    }
  }
}

function playMultiVoiceMeasure(
  measureItem: MultiVoiceGameNote,
  measureIndex: number,
  audio: ReturnType<typeof useAudio>,
  bpm: number
) {
  const timedNotes = extractTimedNotesFromMultiVoice(measureItem)
  audio.playTimedSequence([timedNotes], bpm, measureIndex)
}

function playSingleNoteMeasure(
  measureIndex: number,
  sequence: ReturnType<typeof useGameStore>['sequence'],
  audio: ReturnType<typeof useAudio>,
  bpm: number
) {
  const notesPerMeasure = 4
  const startIndex = measureIndex * notesPerMeasure
  const endIndex = startIndex + notesPerMeasure
  const measureItems = sequence.slice(startIndex, endIndex)
  const measureNotes = getNoteDefinitionsFromSequence(measureItems)
  audio.playSequence(measureNotes, bpm, startIndex)
}

function createPlayMeasureHandler(audio: ReturnType<typeof useAudio>) {
  return (measureIndex: number) => {
    const state = useGameStore.getState()
    const bpm = useSettingsStore.getState().playbackBpm

    if (state.config.lessonType === 'multi-voice') {
      const measureItem = state.sequence[measureIndex]
      if (measureItem && isMultiVoiceNote(measureItem)) {
        playMultiVoiceMeasure(measureItem, measureIndex, audio, bpm)
      }
    } else {
      playSingleNoteMeasure(measureIndex, state.sequence, audio, bpm)
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
    handleChangeInstrument: createChangeInstrumentHandler(),
    handleGenerate: createGenerateHandler(feedback),
    handlePlayAll: createPlayAllHandler(audio),
    handlePlayCurrentNote: createPlayCurrentNoteHandler(audio),
    handlePlayMeasure: createPlayMeasureHandler(audio),
    handleAnswerSelect: createAnswerHandler(game, audio, feedback),
    handlePlayAgain: createPlayAgainHandler(),
  }
}
