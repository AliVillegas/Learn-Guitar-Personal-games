import type { GameState, GameAction } from '../types/game'
import type { SolfegeNote, GuitarString } from '../types/music'
import { createNoteDefinition, getSolfegeFromString, getOctaveFromString } from '../utils/notes'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function pickRandomString(strings: GuitarString[]): GuitarString {
  const index = Math.floor(Math.random() * strings.length)
  return strings[index]
}

function getValidStrings(
  selectedNotes: SolfegeNote[],
  selectedStrings: GuitarString[]
): GuitarString[] {
  const availableStrings = selectedStrings.length > 0 ? selectedStrings : [6, 5, 4, 3, 2, 1]
  return availableStrings.filter((str) => {
    const solfege = getSolfegeFromString(str)
    return selectedNotes.includes(solfege)
  })
}

function createNoteFromString(guitarString: GuitarString) {
  const solfege = getSolfegeFromString(guitarString)
  const octave = getOctaveFromString(guitarString)
  return createNoteDefinition(solfege, octave)
}

function generateSequence(
  selectedNotes: SolfegeNote[],
  selectedStrings: GuitarString[],
  measureCount: number
) {
  const totalNotes = measureCount * 4
  const sequence = []
  const validStrings = getValidStrings(selectedNotes, selectedStrings)

  if (validStrings.length === 0) {
    return sequence
  }

  for (let i = 0; i < totalNotes; i++) {
    const guitarString = pickRandomString(validStrings)
    const note = createNoteFromString(guitarString)
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

function handleSetConfig(state: GameState, payload: Partial<GameState['config']>): GameState {
  return {
    ...state,
    config: {
      ...state.config,
      ...payload,
    },
  }
}

function handleGenerateSequence(state: GameState): GameState {
  const sequence = generateSequence(
    state.config.selectedNotes,
    state.config.selectedStrings,
    state.config.measureCount
  )

  return {
    ...state,
    phase: 'playing',
    sequence,
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },
  }
}

function handleIncorrectAnswer(
  state: GameState,
  newSequence: typeof state.sequence,
  newScore: typeof state.score
): GameState {
  return {
    ...state,
    sequence: newSequence,
    score: newScore,
  }
}

function handleCorrectAnswer(
  state: GameState,
  newSequence: typeof state.sequence,
  newScore: typeof state.score
): GameState {
  const nextIndex = state.currentIndex + 1
  const isComplete = nextIndex >= state.sequence.length

  if (isComplete) {
    return {
      ...state,
      phase: 'complete',
      sequence: newSequence,
      score: newScore,
    }
  }

  newSequence[nextIndex] = {
    ...newSequence[nextIndex],
    status: 'active',
  }

  return {
    ...state,
    sequence: newSequence,
    currentIndex: nextIndex,
    score: newScore,
  }
}

function updateSequenceWithAnswer(
  state: GameState,
  isCorrect: boolean
): { sequence: typeof state.sequence; score: typeof state.score } {
  const currentNote = state.sequence[state.currentIndex]
  const newSequence = [...state.sequence]
  newSequence[state.currentIndex] = {
    ...currentNote,
    status: isCorrect ? 'correct' : 'incorrect',
  }

  const newScore = {
    correct: isCorrect ? state.score.correct + 1 : state.score.correct,
    incorrect: isCorrect ? state.score.incorrect : state.score.incorrect + 1,
  }

  return { sequence: newSequence, score: newScore }
}

function handleSubmitAnswer(state: GameState, answer: SolfegeNote): GameState {
  const currentNote = state.sequence[state.currentIndex]
  if (!currentNote) {
    return state
  }

  const isCorrect = currentNote.note.solfege === answer
  const { sequence: newSequence, score: newScore } = updateSequenceWithAnswer(state, isCorrect)

  if (!isCorrect) {
    return handleIncorrectAnswer(state, newSequence, newScore)
  }

  return handleCorrectAnswer(state, newSequence, newScore)
}

function handleReset(state: GameState): GameState {
  return {
    phase: 'config',
    config: state.config,
    sequence: [],
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'SET_CONFIG') {
    return handleSetConfig(state, action.payload)
  }

  if (action.type === 'GENERATE_SEQUENCE') {
    return handleGenerateSequence(state)
  }

  if (action.type === 'SUBMIT_ANSWER') {
    return handleSubmitAnswer(state, action.payload)
  }

  if (action.type === 'RESET') {
    return handleReset(state)
  }

  return state
}
