import { create } from 'zustand'
import type { GameNote, SolfegeNote, MeasureCount, StringNoteConfig } from '../../types/music'
import type { InstrumentType } from '../../types/audio'
import { createNoteDefinition, getNotesForString, getAllGuitarStrings } from '../../utils/notes'
import { useSettingsStore } from '../../store/settingsStore'
import type { LessonPhase, LessonScore } from '../common/types'

function createInitialStringNotes(): StringNoteConfig[] {
  return getAllGuitarStrings().map((string) => ({
    string,
    notes: getNotesForString(string).map((n) => n.solfege),
  }))
}

interface Lesson1Config {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
}

interface Lesson1State {
  phase: LessonPhase
  config: Lesson1Config
  sequence: GameNote[]
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

function generateSequence(stringNotes: StringNoteConfig[], measureCount: MeasureCount): GameNote[] {
  const totalNotes = measureCount * 4
  const sequence: GameNote[] = []
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
  sequence: GameNote[],
  currentIndex: number,
  isCorrect: boolean
): GameNote[] {
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

function activateNextNote(sequence: GameNote[], nextIndex: number): GameNote[] {
  const newSequence = [...sequence]
  newSequence[nextIndex] = {
    ...newSequence[nextIndex],
    status: 'active',
  }
  return newSequence
}

function processAnswer(state: Lesson1State, answer: SolfegeNote): Partial<Lesson1State> | null {
  if (state.phase !== 'playing') return null

  const currentNote = state.sequence[state.currentIndex]
  if (!currentNote) return null

  const isCorrect = currentNote.note.solfege === answer
  const newSequence = updateSequenceWithAnswer(state.sequence, state.currentIndex, isCorrect)
  const newScore = calculateNewScore(state.score, isCorrect)

  if (!isCorrect) {
    return {
      sequence: newSequence,
      score: newScore,
    }
  }

  const nextIndex = state.currentIndex + 1
  const isComplete = nextIndex >= state.sequence.length

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

function loadConfigFromSettings(): Lesson1Config {
  try {
    const settings = useSettingsStore.getState()
    return {
      stringNotes: settings.stringNotes,
      measureCount: settings.measureCount,
      instrument: settings.instrument,
    }
  } catch {
    return {
      stringNotes: createInitialStringNotes(),
      measureCount: 1,
      instrument: 'guitar-classical',
    }
  }
}

interface Lesson1Store extends Lesson1State {
  setConfig: (config: Partial<Lesson1Config>) => void
  generateSequence: () => void
  submitAnswer: (note: SolfegeNote) => void
  reset: () => void
}

function createSetConfigHandler(set: (fn: (state: Lesson1State) => Partial<Lesson1State>) => void) {
  return (partialConfig: Partial<Lesson1Config>) => {
    set((state) => ({
      config: {
        ...state.config,
        ...partialConfig,
      },
    }))
  }
}

function createGenerateSequenceHandler(
  set: (fn: (state: Lesson1State) => Partial<Lesson1State>) => void
) {
  return () => {
    set((state) => {
      const sequence = generateSequence(state.config.stringNotes, state.config.measureCount)
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
  set: (fn: (state: Lesson1State) => Partial<Lesson1State>) => void
) {
  return (answer: SolfegeNote) => {
    set((state) => {
      const result = processAnswer(state, answer)
      return result || state
    })
  }
}

function createResetHandler(set: (fn: (state: Lesson1State) => Partial<Lesson1State>) => void) {
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

function createLesson1Store(
  set: (fn: (state: Lesson1State) => Partial<Lesson1State>) => void
): Lesson1Store {
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

export const useLesson1Store = create<Lesson1Store>((set) => createLesson1Store(set))
