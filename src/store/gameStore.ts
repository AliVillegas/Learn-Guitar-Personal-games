import { create } from 'zustand'
import type { GameState, GameConfig, StringNoteConfig } from '../types/game'
import type { SolfegeNote } from '../types/music'
import { createNoteDefinition, getNotesForString, getAllGuitarStrings } from '../utils/notes'

function createInitialStringNotes(): GameConfig['stringNotes'] {
  return getAllGuitarStrings().map((string) => ({
    string,
    notes: getNotesForString(string).map((n) => n.solfege),
  }))
}

const initialConfig: GameConfig = {
  selectedNotes: ['do', 're', 'mi'],
  stringNotes: createInitialStringNotes(),
  measureCount: 1,
  instrument: 'guitar-classical',
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
): Array<{ solfege: SolfegeNote; octave: 3 | 4 }> {
  const available: Array<{ solfege: SolfegeNote; octave: 3 | 4 }> = []

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
  newSequence[nextIndex] = {
    ...newSequence[nextIndex],
    status: 'active',
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

function processAnswer(state: GameState, answer: SolfegeNote): Partial<GameState> | null {
  if (state.phase !== 'playing') return null

  const currentNote = state.sequence[state.currentIndex]
  if (!currentNote) return null

  const isCorrect = currentNote.note.solfege === answer
  const newSequence = updateSequenceWithAnswer(state.sequence, state.currentIndex, isCorrect)
  const newScore = calculateNewScore(state.score, isCorrect)

  if (!isCorrect) {
    return handleIncorrectAnswer(newSequence, newScore)
  }

  return handleCorrectAnswer(newSequence, newScore, state.currentIndex)
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
    const sequence = generateSequence(state.config.stringNotes, state.config.measureCount)
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

export const useGameStore = create<GameStore>((set) => ({
  phase: 'config',
  config: initialConfig,
  sequence: [],
  currentIndex: 0,
  score: { correct: 0, incorrect: 0 },

  setConfig: (partialConfig) => set(createSetConfigHandler()(partialConfig)),

  generateSequence: () => set(createGenerateSequenceHandler()),

  submitAnswer: (answer) =>
    set((state) => {
      const result = processAnswer(state, answer)
      return result || state
    }),

  reset: () => set(createResetHandler()),
}))
