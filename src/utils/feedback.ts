import { getAllSolfegeNotes } from './notes'
import type { SolfegeNote } from '../types/music'

export function createInitialFeedbackState(): Record<
  SolfegeNote,
  'idle' | 'correct' | 'incorrect'
> {
  const notes = getAllSolfegeNotes()
  return notes.reduce(
    (acc, note) => {
      acc[note] = 'idle'
      return acc
    },
    {} as Record<SolfegeNote, 'idle'>
  )
}
