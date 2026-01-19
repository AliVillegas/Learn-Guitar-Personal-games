import { create } from 'zustand'
import type { GameNote, SolfegeNote, MeasureCount, StringNoteConfig } from '../../types/music'
import type { InstrumentType } from '../../types/audio'
import { createNoteDefinition, getNotesForString } from '../../utils/notes'
import { useSettingsStore } from '../../store/settingsStore'
import type { LessonPhase, LessonScore } from '../common/types'

const CHORD_PATTERNS: Record<string, SolfegeNote[]> = {
  C: ['do', 'mi', 'sol'],
  D: ['re', 'fa', 'la'],
  E: ['mi', 'sol', 'si'],
  F: ['fa', 'la', 'do'],
  G: ['sol', 'si', 're'],
  A: ['la', 'do', 'mi'],
  B: ['si', 're', 'fa'],
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function pickRandomNote<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function generateChordSequence(stringNotes: StringNoteConfig[]): GameNote[] {
  const sequence: GameNote[] = []
  const fixedMeasures = 4
  const totalNotes = fixedMeasures * 4

  const availableStrings = stringNotes
    .filter((sn) => sn.notes.length > 0)
    .map((sn) => sn.string)

  if (availableStrings.length === 0) return sequence

  const chordKeys = Object.keys(CHORD_PATTERNS)
  const selectedChord = pickRandomNote(chordKeys)
  const chordNotes = CHORD_PATTERNS[selectedChord]

  for (let i = 0; i < totalNotes; i++) {
    const chordIndex = i % chordNotes.length
    const solfege = chordNotes[chordIndex]
    const string = pickRandomNote(availableStrings)
    const stringNotesList = getNotesForString(string as 1 | 2 | 3 | 4 | 5 | 6)
    const noteDef = stringNotesList.find((n) => n.solfege === solfege)

    if (noteDef) {
      const note = createNoteDefinition(noteDef.solfege, noteDef.octave)
      sequence.push({
        id: generateId(),
        note,
        status: 'pending' as const,
      })
    }
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

interface Lesson4Config {
  stringNotes: StringNoteConfig[]
  instrument: InstrumentType
}

interface Lesson4State {
  phase: LessonPhase
  config: Lesson4Config
  sequence: GameNote[]
  currentIndex: number
  score: LessonScore
}

function processAnswer(state: Lesson4State, answer: SolfegeNote): Partial<Lesson4State> | null {
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

function loadConfigFromSettings(): Lesson4Config {
  try {
    const settings = useSettingsStore.getState()
    return {
      stringNotes: settings.stringNotes,
      instrument: settings.instrument,
    }
  } catch {
    return {
      stringNotes: [],
      instrument: 'guitar-classical',
    }
  }
}

interface Lesson4Store extends Lesson4State {
  setConfig: (config: Partial<Lesson4Config>) => void
  generateSequence: () => void
  submitAnswer: (note: SolfegeNote) => void
  reset: () => void
}

function createSetConfigHandler(set: (fn: (state: Lesson4State) => Partial<Lesson4State>) => void) {
  return (partialConfig: Partial<Lesson4Config>) => {
    set((state) => ({
      config: {
        ...state.config,
        ...partialConfig,
      },
    }))
  }
}

function createGenerateSequenceHandler(
  set: (fn: (state: Lesson4State) => Partial<Lesson4State>) => void
) {
  return () => {
    set((state) => {
      const sequence = generateChordSequence(state.config.stringNotes)
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
  set: (fn: (state: Lesson4State) => Partial<Lesson4State>) => void
) {
  return (answer: SolfegeNote) => {
    set((state) => {
      const result = processAnswer(state, answer)
      return result || state
    })
  }
}

function createResetHandler(set: (fn: (state: Lesson4State) => Partial<Lesson4State>) => void) {
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

function createLesson4Store(
  set: (fn: (state: Lesson4State) => Partial<Lesson4State>) => void
): Lesson4Store {
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

export const useLesson4Store = create<Lesson4Store>((set) => createLesson4Store(set))
