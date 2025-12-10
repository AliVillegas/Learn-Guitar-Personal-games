import { create } from 'zustand'
import type { GameState, GameConfig, StringNoteConfig } from '../types/game'
import type {
  SolfegeNote,
  GuitarString,
  MultiVoiceGameNote,
  VoiceNote,
  MelodyStringSelection,
} from '../types/music'
import {
  createNoteDefinition,
  getNotesForString,
  getAllGuitarStrings,
  getNotesForString as getStringNotes,
} from '../utils/notes'
import { useSettingsStore } from './settingsStore'

function createInitialStringNotes(): StringNoteConfig[] {
  return getAllGuitarStrings().map((string) => ({
    string,
    notes: getNotesForString(string).map((n) => n.solfege),
  }))
}

export function getCurrentLessonConfig(config: GameConfig) {
  return config.lessonType === 'multi-voice' ? config.multiVoice : config.singleNotes
}

export function getCurrentInstrument(config: GameConfig) {
  return getCurrentLessonConfig(config).instrument
}

export function getCurrentMeasureCount(config: GameConfig) {
  return getCurrentLessonConfig(config).measureCount
}

export function getCurrentStringNotes(config: GameConfig) {
  return getCurrentLessonConfig(config).stringNotes
}

const initialConfig: GameConfig = {
  lessonType: 'single-notes',
  singleNotes: {
    selectedNotes: ['do', 're', 'mi'],
    stringNotes: createInitialStringNotes(),
    measureCount: 1,
    instrument: 'guitar-classical',
  },
  multiVoice: {
    stringNotes: createInitialStringNotes(),
    measureCount: 4,
    melodyStrings: 'both',
    instrument: 'guitar-classical',
  },
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function pickRandomNote<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function getAvailableNotes(
  stringNotes: StringNoteConfig[]
): Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> {
  const available: Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> = []

  stringNotes.forEach((stringConfig) => {
    const stringNotesList = getNotesForString(stringConfig.string)
    stringNotesList.forEach((noteDef) => {
      if (stringConfig.notes.includes(noteDef.solfege)) {
        available.push(noteDef)
      }
    })
  })

  return available
}

function getAvailableNotesForString(
  stringNotes: StringNoteConfig[],
  guitarString: GuitarString
): Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> {
  const stringConfig = stringNotes.find((sc) => sc.string === guitarString)
  if (!stringConfig) return []

  const stringNotesList = getStringNotes(guitarString)
  return stringNotesList.filter((noteDef) => stringConfig.notes.includes(noteDef.solfege))
}

function pickRandomFromString(
  guitarString: GuitarString,
  stringNotes: StringNoteConfig[]
): { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null {
  const available = getAvailableNotesForString(stringNotes, guitarString)
  if (available.length === 0) return null
  return pickRandomNote(available)
}

function createBassVoice(bassNoteDef: { solfege: SolfegeNote; octave: 3 | 4 | 5 }): VoiceNote[] {
  const bassNote = createNoteDefinition(bassNoteDef.solfege, bassNoteDef.octave)
  return [{ note: bassNote, duration: 'h.' }]
}

function createMelodyVoice(
  melodyNote1Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  melodyNote2Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): VoiceNote[] {
  const melodyNote1 = createNoteDefinition(melodyNote1Def.solfege, melodyNote1Def.octave)
  const melodyNote2 = createNoteDefinition(melodyNote2Def.solfege, melodyNote2Def.octave)
  return [
    { note: null, duration: 'qr' },
    { note: melodyNote1, duration: 'q' },
    { note: melodyNote2, duration: 'q' },
  ]
}

function pickMelodyNotes(
  melodyStrings: GuitarString[],
  stringNotes: StringNoteConfig[]
): {
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
} | null {
  const melodyNote1Def = pickRandomFromString(pickRandomNote(melodyStrings), stringNotes)
  const melodyNote2Def = pickRandomFromString(pickRandomNote(melodyStrings), stringNotes)

  if (!melodyNote1Def || !melodyNote2Def) return null

  return { note1: melodyNote1Def, note2: melodyNote2Def }
}

function getAllowedMelodyStrings(melodyStringsConfig: MelodyStringSelection): GuitarString[] {
  if (melodyStringsConfig === 'both') {
    return [2, 3]
  }
  return [melodyStringsConfig]
}

function generateMultiVoiceMeasure(
  stringNotes: StringNoteConfig[],
  measureIndex: number,
  melodyStringsConfig: MelodyStringSelection
): MultiVoiceGameNote | null {
  const bassStrings: GuitarString[] = [4, 5, 6]
  const bassString = pickRandomNote(bassStrings)
  const bassNoteDef = pickRandomFromString(bassString, stringNotes)

  if (!bassNoteDef) return null

  const bassVoice = createBassVoice(bassNoteDef)

  const allowedMelodyStrings = getAllowedMelodyStrings(melodyStringsConfig)
  const melodyStrings: GuitarString[] = allowedMelodyStrings.filter((s) => s < bassString)
  if (melodyStrings.length === 0) return null

  const melodyNotes = pickMelodyNotes(melodyStrings, stringNotes)
  if (!melodyNotes) return null

  const melodyVoice = createMelodyVoice(melodyNotes.note1, melodyNotes.note2)

  return {
    id: generateId(),
    bassVoice,
    melodyVoice,
    status: measureIndex === 0 ? 'active' : 'pending',
  }
}

function generateMultiVoiceSequence(
  stringNotes: StringNoteConfig[],
  measureCount: number,
  melodyStringsConfig: MelodyStringSelection
): MultiVoiceGameNote[] {
  const sequence: MultiVoiceGameNote[] = []

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
    const measure = generateMultiVoiceMeasure(stringNotes, measureIndex, melodyStringsConfig)
    if (measure) {
      sequence.push(measure)
    }
  }

  console.log('Generated multi-voice sequence:', sequence)
  return sequence
}

function generateSequence(stringNotes: StringNoteConfig[], measureCount: number) {
  const totalNotes = measureCount * 4
  const sequence = []
  const availableNotes = getAvailableNotes(stringNotes)

  if (availableNotes.length === 0) {
    return sequence
  }

  for (let i = 0; i < totalNotes; i++) {
    const noteDef = pickRandomNote(availableNotes)
    const note = createNoteDefinition(noteDef.solfege, noteDef.octave)
    sequence.push({
      id: generateId(),
      note,
      status: 'pending' as const,
    })
  }

  if (sequence.length > 0) {
    sequence[0].status = 'active'
  }

  return sequence
}

function updateSequenceWithAnswer(
  sequence: GameState['sequence'],
  currentIndex: number,
  isCorrect: boolean
): GameState['sequence'] {
  const newSequence = [...sequence]
  newSequence[currentIndex] = {
    ...newSequence[currentIndex],
    status: isCorrect ? 'correct' : 'incorrect',
  }
  return newSequence
}

function calculateNewScore(
  currentScore: GameState['score'],
  isCorrect: boolean
): GameState['score'] {
  return {
    correct: isCorrect ? currentScore.correct + 1 : currentScore.correct,
    incorrect: isCorrect ? currentScore.incorrect : currentScore.incorrect + 1,
  }
}

function handleIncorrectAnswer(
  sequence: GameState['sequence'],
  score: GameState['score']
): Partial<GameState> {
  return {
    sequence,
    score,
  }
}

function activateNextNote(
  sequence: GameState['sequence'],
  nextIndex: number
): GameState['sequence'] {
  const newSequence = [...sequence]
  const nextNote = newSequence[nextIndex]
  if (isMultiVoiceNote(nextNote)) {
    newSequence[nextIndex] = {
      ...nextNote,
      status: 'active',
    }
  } else {
    newSequence[nextIndex] = {
      ...nextNote,
      status: 'active',
    }
  }
  return newSequence
}

function handleCorrectAnswer(
  sequence: GameState['sequence'],
  score: GameState['score'],
  currentIndex: number
): Partial<GameState> {
  const nextIndex = currentIndex + 1
  const isComplete = nextIndex >= sequence.length

  if (isComplete) {
    return {
      phase: 'complete' as const,
      sequence,
      score,
    }
  }

  return {
    sequence: activateNextNote(sequence, nextIndex),
    currentIndex: nextIndex,
    score,
  }
}

function isMultiVoiceNote(note: GameNote | MultiVoiceGameNote): note is MultiVoiceGameNote {
  return 'bassVoice' in note && 'melodyVoice' in note
}

function updateMultiVoiceSequenceWithAnswer(
  sequence: MultiVoiceGameNote[],
  currentIndex: number,
  isCorrect: boolean
): MultiVoiceGameNote[] {
  const newSequence = [...sequence]
  newSequence[currentIndex] = {
    ...newSequence[currentIndex],
    status: isCorrect ? 'correct' : 'incorrect',
  }
  return newSequence
}

function checkMultiVoiceAnswer(currentNote: MultiVoiceGameNote, answer: SolfegeNote): boolean {
  const melodyNotes = currentNote.melodyVoice
    .filter((vn) => vn.note !== null)
    .map((vn) => {
      if (vn.note === null) return null
      return vn.note.solfege
    })
    .filter((solfege): solfege is SolfegeNote => solfege !== null)
  return melodyNotes.includes(answer)
}

function processMultiVoiceAnswer(
  state: GameState,
  currentNote: MultiVoiceGameNote,
  answer: SolfegeNote
): Partial<GameState> | null {
  const isCorrect = checkMultiVoiceAnswer(currentNote, answer)
  const newSequence = updateMultiVoiceSequenceWithAnswer(
    state.sequence as MultiVoiceGameNote[],
    state.currentIndex,
    isCorrect
  )
  const newScore = calculateNewScore(state.score, isCorrect)

  if (!isCorrect) {
    return handleIncorrectAnswer(newSequence as GameState['sequence'], newScore)
  }

  return handleCorrectAnswer(newSequence as GameState['sequence'], newScore, state.currentIndex)
}

function processSingleNoteAnswer(
  state: GameState,
  currentNote: GameNote,
  answer: SolfegeNote
): Partial<GameState> | null {
  const isCorrect = currentNote.note.solfege === answer
  const newSequence = updateSequenceWithAnswer(
    state.sequence as GameNote[],
    state.currentIndex,
    isCorrect
  )
  const newScore = calculateNewScore(state.score, isCorrect)

  if (!isCorrect) {
    return handleIncorrectAnswer(newSequence, newScore)
  }

  return handleCorrectAnswer(newSequence, newScore, state.currentIndex)
}

function processAnswer(state: GameState, answer: SolfegeNote): Partial<GameState> | null {
  if (state.phase !== 'playing') return null

  const currentNote = state.sequence[state.currentIndex]
  if (!currentNote) return null

  if (isMultiVoiceNote(currentNote)) {
    return processMultiVoiceAnswer(state, currentNote, answer)
  }

  return processSingleNoteAnswer(state, currentNote, answer)
}

function createSetConfigHandler() {
  return (partialConfig: Partial<GameConfig>) => (state: GameState) => ({
    config: {
      ...state.config,
      ...partialConfig,
    },
  })
}

function createGenerateSequenceHandler() {
  return (state: GameState) => {
    const sequence =
      state.config.lessonType === 'multi-voice'
        ? generateMultiVoiceSequence(
            state.config.multiVoice.stringNotes,
            state.config.multiVoice.measureCount,
            state.config.multiVoice.melodyStrings
          )
        : generateSequence(
            state.config.singleNotes.stringNotes,
            state.config.singleNotes.measureCount
          )
    return {
      phase: 'playing' as const,
      sequence,
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    }
  }
}

function createResetHandler() {
  return (state: GameState) => ({
    phase: 'config' as const,
    sequence: [],
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },
    config: state.config,
  })
}

interface GameStore extends GameState {
  setConfig: (config: Partial<GameConfig>) => void
  generateSequence: () => void
  submitAnswer: (note: SolfegeNote) => void
  reset: () => void
}

function loadConfigFromSettings(): GameConfig {
  try {
    const settings = useSettingsStore.getState()
    return {
      lessonType: settings.selectedLesson,
      singleNotes: {
        selectedNotes: ['do', 're', 'mi'],
        stringNotes: settings.stringNotes,
        measureCount: settings.measureCount,
        instrument: settings.instrument,
      },
      multiVoice: {
        stringNotes: settings.stringNotes,
        measureCount: 4,
        melodyStrings: 'both',
        instrument: settings.instrument,
      },
    }
  } catch {
    return initialConfig
  }
}

function createSubmitAnswerHandler() {
  return (answer: SolfegeNote) => (state: GameState) => {
    const result = processAnswer(state, answer)
    return result || state
  }
}

export const useGameStore = create<GameStore>((set) => {
  return {
    phase: 'config',
    config: loadConfigFromSettings(),
    sequence: [],
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },

    setConfig: (partialConfig) => set(createSetConfigHandler()(partialConfig)),

    generateSequence: () => set(createGenerateSequenceHandler()),

    submitAnswer: (answer) => set(createSubmitAnswerHandler()(answer)),

    reset: () => set(createResetHandler()),
  }
})
