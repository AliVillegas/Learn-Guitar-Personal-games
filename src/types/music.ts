export type SolfegeNote = 'do' | 're' | 'mi' | 'fa' | 'sol' | 'la' | 'si'

export type LetterNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

export type GuitarString = 1 | 2 | 3 | 4 | 5 | 6

export interface NoteDefinition {
  solfege: SolfegeNote
  letter: LetterNote
  frequency: number
  staffPosition: number
  octave: 3 | 4 | 5
}

export type MeasureCount = 1 | 2 | 3 | 4

export type MultiVoiceMeasureCount = 4 | 5 | 6 | 7 | 8

export type MelodyStringSelection = 2 | 3 | 'both'

export type BeatsPerMeasure = 3 | 4

export type LessonType = 'single-notes' | 'multi-voice'

export type NoteDuration = 'q' | 'h.' | 'qr'

export interface VoiceNote {
  note: NoteDefinition | null
  duration: NoteDuration
}

export interface MultiVoiceGameNote {
  id: string
  bassVoice: VoiceNote[]
  melodyVoice: VoiceNote[]
  status: 'pending' | 'active' | 'correct' | 'incorrect'
  allowStacked?: boolean
}

export interface GameNote {
  id: string
  note: NoteDefinition
  status: 'pending' | 'active' | 'correct' | 'incorrect'
}
