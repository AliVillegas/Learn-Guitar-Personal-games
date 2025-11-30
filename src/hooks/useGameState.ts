import { useReducer } from 'react'
import type { GameConfig } from '../types/game'
import { gameReducer } from './useGameReducer'
import { getNotesForString, getAllGuitarStrings } from '../utils/notes'

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
}

const initialState = {
  phase: 'config' as const,
  config: initialConfig,
  sequence: [],
  currentIndex: 0,
  score: { correct: 0, incorrect: 0 },
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const setConfig = (config: Partial<GameConfig>) => {
    dispatch({ type: 'SET_CONFIG', payload: config })
  }

  const generateSequence = () => {
    dispatch({ type: 'GENERATE_SEQUENCE' })
  }

  const submitAnswer = (note: SolfegeNote) => {
    dispatch({ type: 'SUBMIT_ANSWER', payload: note })
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  return {
    state,
    setConfig,
    generateSequence,
    submitAnswer,
    reset,
  }
}
