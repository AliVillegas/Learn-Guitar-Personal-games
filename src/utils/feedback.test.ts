import { describe, it, expect } from 'vitest'
import { createInitialFeedbackState } from './feedback'
import { getAllSolfegeNotes } from './notes'

describe('createInitialFeedbackState', () => {
  it('creates feedback state with all notes set to idle', () => {
    const state = createInitialFeedbackState()
    const allNotes = getAllSolfegeNotes()

    allNotes.forEach((note) => {
      expect(state[note]).toBe('idle')
    })
  })

  it('includes all solfege notes', () => {
    const state = createInitialFeedbackState()
    const allNotes = getAllSolfegeNotes()

    expect(Object.keys(state)).toHaveLength(allNotes.length)
    allNotes.forEach((note) => {
      expect(state).toHaveProperty(note)
    })
  })
})

