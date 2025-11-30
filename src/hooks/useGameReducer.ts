import type { GameState, GameAction, StringNoteConfig } from '../types/game'
import type { SolfegeNote } from '../types/music'
import { createNoteDefinition, getNotesForString } from '../utils/notes'

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
  const sequence = generateSequence(state.config.stringNotes, state.config.measureCount)

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
