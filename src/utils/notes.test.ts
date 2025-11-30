import { describe, it, expect } from 'vitest'
import {
  getNoteFrequency,
  getStaffPosition,
  createNoteDefinition,
  getAllSolfegeNotes,
} from './notes'

describe('getNoteFrequency', () => {
  it('returns correct frequency for A3', () => {
    expect(getNoteFrequency('la', 3)).toBe(220.0)
  })

  it('returns correct frequency for C4', () => {
    expect(getNoteFrequency('do', 4)).toBe(261.63)
  })
})

describe('getStaffPosition', () => {
  it('returns middle line position for A3', () => {
    expect(getStaffPosition('la', 3)).toBe(0)
  })

  it('returns correct position for C3', () => {
    expect(getStaffPosition('do', 3)).toBe(-5)
  })
})

describe('createNoteDefinition', () => {
  it('creates note definition with correct properties', () => {
    const note = createNoteDefinition('mi', 3)
    expect(note.solfege).toBe('mi')
    expect(note.letter).toBe('E')
    expect(note.frequency).toBe(164.81)
    expect(note.staffPosition).toBe(-3)
    expect(note.octave).toBe(3)
  })
})

describe('getAllSolfegeNotes', () => {
  it('returns all seven solfege notes', () => {
    const notes = getAllSolfegeNotes()
    expect(notes).toHaveLength(7)
    expect(notes).toContain('do')
    expect(notes).toContain('si')
  })
})

