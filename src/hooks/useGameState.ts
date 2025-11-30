import { useReducer } from 'react'
import type { SolfegeNote } from '../types/music'
import type { GameConfig } from '../types/game'
import { gameReducer } from './useGameReducer'

const initialConfig: GameConfig = {
  selectedNotes: ['do', 're', 'mi'],
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
