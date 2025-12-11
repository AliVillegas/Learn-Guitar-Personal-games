import { create } from 'zustand'
import type {
  MultiVoiceGameNote,
  SolfegeNote,
  MultiVoiceMeasureCount,
  StringNoteConfig,
  VoiceNote,
} from '../../types/music'
import { createNoteDefinition, getNotesForString, getStaffPosition } from '../../utils/notes'
import { useSettingsStore } from '../../store/settingsStore'
import type { LessonPhase, LessonScore } from '../common/types'

type NoteMode = 'single' | 'stacked' | 'mixed'

interface Lesson2Config {
  measureCount: MultiVoiceMeasureCount
  noteMode: NoteMode
}

interface Lesson2State {
  phase: LessonPhase
  config: Lesson2Config
  sequence: MultiVoiceGameNote[]
  currentIndex: number
  score: LessonScore
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function pickRandomNote<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function getAvailableNotesForString(
  stringNotes: StringNoteConfig[],
  guitarString: number
): Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> {
  const stringConfig = stringNotes.find((sc) => sc.string === guitarString)
  if (!stringConfig) return []

  const stringNotesList = getNotesForString(guitarString as 1 | 2 | 3 | 4 | 5 | 6)
  return stringNotesList.filter((noteDef) => stringConfig.notes.includes(noteDef.solfege))
}

function pickRandomFromString(
  guitarString: number,
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
  melodyNote2Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  allowStacked: boolean
): VoiceNote[] {
  const melodyNote1 = createNoteDefinition(melodyNote1Def.solfege, melodyNote1Def.octave)
  const melodyNote2 = createNoteDefinition(melodyNote2Def.solfege, melodyNote2Def.octave)

  if (allowStacked) {
    return [
      { note: null, duration: 'qr' },
      { note: melodyNote1, duration: 'q' },
      { note: melodyNote2, duration: 'q' },
      { note: melodyNote1, duration: 'q' },
      { note: melodyNote2, duration: 'q' },
    ]
  } else {
    return [
      { note: null, duration: 'qr' },
      { note: melodyNote1, duration: 'q' },
      { note: melodyNote2, duration: 'q' },
    ]
  }
}

function areNotesEqual(
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): boolean {
  return note1.solfege === note2.solfege && note1.octave === note2.octave
}

function areNotesSeconds(
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): boolean {
  const pos1 = getStaffPosition(note1.solfege, note1.octave)
  const pos2 = getStaffPosition(note2.solfege, note2.octave)
  return Math.abs(pos1 - pos2) === 1
}

function isValidStackedPair(
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): boolean {
  return !areNotesEqual(note1, note2) && !areNotesSeconds(note1, note2)
}

function pickStackedMelodyNotes(
  melodyStrings: number[],
  stringNotes: StringNoteConfig[],
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null {
  const maxAttempts = 50
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const note2 = pickRandomFromString(pickRandomNote(melodyStrings), stringNotes)
    if (!note2) return null
    if (isValidStackedPair(note1, note2)) {
      return note2
    }
  }
  return null
}

function pickMelodyNotes(
  melodyStrings: number[],
  stringNotes: StringNoteConfig[],
  allowStacked: boolean
): {
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
} | null {
  const melodyNote1Def = pickRandomFromString(pickRandomNote(melodyStrings), stringNotes)
  if (!melodyNote1Def) return null

  if (!allowStacked) {
    const melodyNote2Def = pickRandomFromString(pickRandomNote(melodyStrings), stringNotes)
    if (!melodyNote2Def) return null
    return { note1: melodyNote1Def, note2: melodyNote2Def }
  }

  const melodyNote2Def = pickStackedMelodyNotes(melodyStrings, stringNotes, melodyNote1Def)
  if (!melodyNote2Def) return null

  return { note1: melodyNote1Def, note2: melodyNote2Def }
}

function shouldUseStackedNotes(noteMode: NoteMode): boolean {
  return noteMode === 'stacked' || (noteMode === 'mixed' && Math.random() > 0.5)
}

function generateMultiVoiceMeasure(
  stringNotes: StringNoteConfig[],
  measureIndex: number,
  noteMode: NoteMode
): MultiVoiceGameNote | null {
  const bassStrings: number[] = [4, 5, 6]
  const bassString = pickRandomNote(bassStrings)
  const bassNoteDef = pickRandomFromString(bassString, stringNotes)

  if (!bassNoteDef) return null

  const bassVoice = createBassVoice(bassNoteDef)

  const melodyStrings: number[] = [2, 3].filter((s) => s < bassString)
  if (melodyStrings.length === 0) return null

  const shouldUseStacked = shouldUseStackedNotes(noteMode)

  const melodyNotes = pickMelodyNotes(melodyStrings, stringNotes, shouldUseStacked)
  if (!melodyNotes) return null

  const melodyVoice = createMelodyVoice(melodyNotes.note1, melodyNotes.note2, shouldUseStacked)

  return {
    id: generateId(),
    bassVoice,
    melodyVoice,
    status: measureIndex === 0 ? 'active' : 'pending',
    allowStacked: shouldUseStacked,
  }
}

function generateMultiVoiceSequence(
  stringNotes: StringNoteConfig[],
  measureCount: MultiVoiceMeasureCount,
  noteMode: NoteMode
): MultiVoiceGameNote[] {
  const sequence: MultiVoiceGameNote[] = []

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
    const measure = generateMultiVoiceMeasure(stringNotes, measureIndex, noteMode)
    if (measure) {
      sequence.push(measure)
    }
  }

  return sequence
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

function calculateNewScore(currentScore: LessonScore, isCorrect: boolean): LessonScore {
  return {
    correct: isCorrect ? currentScore.correct + 1 : currentScore.correct,
    incorrect: isCorrect ? currentScore.incorrect : currentScore.incorrect + 1,
  }
}

function activateNextNote(sequence: MultiVoiceGameNote[], nextIndex: number): MultiVoiceGameNote[] {
  const newSequence = [...sequence]
  newSequence[nextIndex] = {
    ...newSequence[nextIndex],
    status: 'active',
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

function handleIncorrectAnswer(
  sequence: MultiVoiceGameNote[],
  currentIndex: number,
  score: LessonScore
): Partial<Lesson2State> {
  const newSequence = updateMultiVoiceSequenceWithAnswer(sequence, currentIndex, false)
  const newScore = calculateNewScore(score, false)
  return {
    sequence: newSequence,
    score: newScore,
  }
}

function handleCorrectAnswer(
  sequence: MultiVoiceGameNote[],
  currentIndex: number,
  score: LessonScore
): Partial<Lesson2State> {
  const newSequence = updateMultiVoiceSequenceWithAnswer(sequence, currentIndex, true)
  const newScore = calculateNewScore(score, true)
  const nextIndex = currentIndex + 1
  const isComplete = nextIndex >= sequence.length

  if (isComplete) {
    return {
      phase: 'complete' as const,
      sequence: newSequence,
      score: newScore,
    }
  }

  return {
    sequence: activateNextNote(newSequence, nextIndex),
    currentIndex: nextIndex,
    score: newScore,
  }
}

function processAnswer(state: Lesson2State, answer: SolfegeNote): Partial<Lesson2State> | null {
  if (state.phase !== 'playing') return null

  const currentNote = state.sequence[state.currentIndex]
  if (!currentNote) return null

  const isCorrect = checkMultiVoiceAnswer(currentNote, answer)

  if (!isCorrect) {
    return handleIncorrectAnswer(state.sequence, state.currentIndex, state.score)
  }

  return handleCorrectAnswer(state.sequence, state.currentIndex, state.score)
}

function loadConfigFromSettings(): Lesson2Config {
  return {
    measureCount: 4,
    noteMode: 'mixed',
  }
}

interface Lesson2Store extends Lesson2State {
  setConfig: (config: Partial<Lesson2Config>) => void
  generateSequence: () => void
  submitAnswer: (note: SolfegeNote) => void
  reset: () => void
}

function createSetConfigHandler(set: (fn: (state: Lesson2State) => Partial<Lesson2State>) => void) {
  return (partialConfig: Partial<Lesson2Config>) => {
    set((state) => ({
      config: {
        ...state.config,
        ...partialConfig,
      },
    }))
  }
}

function createGenerateSequenceHandler(
  set: (fn: (state: Lesson2State) => Partial<Lesson2State>) => void
) {
  return () => {
    set((state) => {
      const settings = useSettingsStore.getState()
      const sequence = generateMultiVoiceSequence(
        settings.stringNotes,
        state.config.measureCount,
        state.config.noteMode
      )
      return {
        phase: 'playing' as const,
        sequence,
        currentIndex: 0,
        score: { correct: 0, incorrect: 0 },
      }
    })
  }
}

function createSubmitAnswerHandler(
  set: (fn: (state: Lesson2State) => Partial<Lesson2State>) => void
) {
  return (answer: SolfegeNote) => {
    set((state) => {
      const result = processAnswer(state, answer)
      return result || state
    })
  }
}

function createResetHandler(set: (fn: (state: Lesson2State) => Partial<Lesson2State>) => void) {
  return () => {
    set((state) => ({
      phase: 'config' as const,
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
      config: state.config,
    }))
  }
}

function createLesson2Store(
  set: (fn: (state: Lesson2State) => Partial<Lesson2State>) => void
): Lesson2Store {
  return {
    phase: 'config',
    config: loadConfigFromSettings(),
    sequence: [],
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },
    setConfig: createSetConfigHandler(set),
    generateSequence: createGenerateSequenceHandler(set),
    submitAnswer: createSubmitAnswerHandler(set),
    reset: createResetHandler(set),
  }
}

export const useLesson2Store = create<Lesson2Store>((set) => createLesson2Store(set))
