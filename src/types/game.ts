import type { SolfegeNote, MeasureCount, GameNote, GuitarString } from './music'

export type GamePhase = 'config' | 'playing' | 'complete'

export interface GameConfig {
  selectedNotes: SolfegeNote[]
  selectedStrings: GuitarString[]
  measureCount: MeasureCount
}

export interface GameState {
  phase: GamePhase
  config: GameConfig
  sequence: GameNote[]
  currentIndex: number
  score: { correct: number; incorrect: number }
}

export type GameAction =
  | { type: 'SET_CONFIG'; payload: Partial<GameConfig> }
  | { type: 'GENERATE_SEQUENCE' }
  | { type: 'SUBMIT_ANSWER'; payload: SolfegeNote }
  | { type: 'RESET' }
