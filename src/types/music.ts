export type SolfegeNote = 'do' | 're' | 'mi' | 'fa' | 'sol' | 'la' | 'si'

export type LetterNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

export interface NoteDefinition {
  solfege: SolfegeNote
  letter: LetterNote
  frequency: number
  staffPosition: number
  octave: 3 | 4
}

export type MeasureCount = 1 | 2 | 3 | 4

export type BeatsPerMeasure = 4

export interface GameNote {
  id: string
  note: NoteDefinition
  status: 'pending' | 'active' | 'correct' | 'incorrect'
}
