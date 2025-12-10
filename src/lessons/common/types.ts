import type {
  GameNote,
  MultiVoiceGameNote,
  MeasureCount,
  MultiVoiceMeasureCount,
} from '../../types/music'

export type LessonPhase = 'config' | 'playing' | 'complete'

export interface LessonScore {
  correct: number
  incorrect: number
}

export type LessonSequence = GameNote[] | MultiVoiceGameNote[]

export interface LessonConfig {
  measureCount: MeasureCount | MultiVoiceMeasureCount
}
