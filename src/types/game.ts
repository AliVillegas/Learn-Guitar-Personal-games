import type {
  SolfegeNote,
  MeasureCount,
  GameNote,
  GuitarString,
  LessonType,
  MultiVoiceGameNote,
  MultiVoiceMeasureCount,
  MelodyStringSelection,
} from './music'

export type GamePhase = 'config' | 'playing' | 'complete'

export interface StringNoteConfig {
  string: GuitarString
  notes: SolfegeNote[]
}

import type { InstrumentType } from './audio'

export interface SingleNotesConfig {
  selectedNotes: SolfegeNote[]
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
}

export interface MultiVoiceConfig {
  stringNotes: StringNoteConfig[]
  measureCount: MultiVoiceMeasureCount
  melodyStrings: MelodyStringSelection
  instrument: InstrumentType
}

export interface GameConfig {
  lessonType: LessonType
  singleNotes: SingleNotesConfig
  multiVoice: MultiVoiceConfig
}

export interface GameState {
  phase: GamePhase
  config: GameConfig
  sequence: GameNote[] | MultiVoiceGameNote[]
  currentIndex: number
  score: { correct: number; incorrect: number }
}

export type GameAction =
  | { type: 'SET_CONFIG'; payload: Partial<GameConfig> }
  | { type: 'GENERATE_SEQUENCE' }
  | { type: 'SUBMIT_ANSWER'; payload: SolfegeNote }
  | { type: 'RESET' }
