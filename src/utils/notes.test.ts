import { describe, it, expect } from 'vitest'
import {
  getNoteFrequency,
  getStaffPosition,
  createNoteDefinition,
  getAllSolfegeNotes,
  getSolfegeFromString,
  getOctaveFromString,
  getAllGuitarStrings,
  getNotesFromStrings,
} from './notes'
import type { SolfegeNote, GuitarString } from '../types/music'

describe('getNoteFrequency', () => {
  const expectedFrequencies: Record<string, { octave3: number; octave4?: number }> = {
    do: { octave3: 130.81, octave4: 261.63 },
    re: { octave3: 146.83, octave4: 293.66 },
    mi: { octave3: 164.81, octave4: 329.63 },
    fa: { octave3: 174.61, octave4: 349.23 },
    sol: { octave3: 196.0, octave4: 392.0 },
    la: { octave3: 220.0 },
    si: { octave3: 246.94 },
  }

  Object.entries(expectedFrequencies).forEach(([solfege, frequencies]) => {
    it(`returns correct frequency for ${solfege.toUpperCase()}3`, () => {
      expect(getNoteFrequency(solfege as SolfegeNote, 3)).toBe(frequencies.octave3)
    })

    if (frequencies.octave4) {
      it(`returns correct frequency for ${solfege.toUpperCase()}4`, () => {
        expect(getNoteFrequency(solfege as SolfegeNote, 4)).toBe(frequencies.octave4)
      })
    }
  })
})

describe('getStaffPosition', () => {
  const expectedPositions: Record<string, { octave3: number; octave4?: number }> = {
    do: { octave3: -5, octave4: 2 },
    re: { octave3: -4, octave4: 3 },
    mi: { octave3: -3, octave4: 4 },
    fa: { octave3: -2, octave4: 5 },
    sol: { octave3: -1, octave4: 6 },
    la: { octave3: 0 },
    si: { octave3: 1 },
  }

  Object.entries(expectedPositions).forEach(([solfege, positions]) => {
    it(`returns correct position for ${solfege.toUpperCase()}3`, () => {
      expect(getStaffPosition(solfege as SolfegeNote, 3)).toBe(positions.octave3)
    })

    if (positions.octave4 !== undefined) {
      it(`returns correct position for ${solfege.toUpperCase()}4`, () => {
        expect(getStaffPosition(solfege as SolfegeNote, 4)).toBe(positions.octave4)
      })
    }
  })
})

describe('createNoteDefinition', () => {
  it('creates note definition with correct properties for mi3', () => {
    const note = createNoteDefinition('mi', 3)
    expect(note.solfege).toBe('mi')
    expect(note.letter).toBe('E')
    expect(note.frequency).toBe(164.81)
    expect(note.staffPosition).toBe(-3)
    expect(note.octave).toBe(3)
  })

  it('creates note definition with correct properties for mi4', () => {
    const note = createNoteDefinition('mi', 4)
    expect(note.solfege).toBe('mi')
    expect(note.letter).toBe('E')
    expect(note.frequency).toBe(329.63)
    expect(note.staffPosition).toBe(4)
    expect(note.octave).toBe(4)
  })

  it('creates note definition with correct properties for all notes in octave 3', () => {
    const notes: SolfegeNote[] = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']
    notes.forEach((solfege) => {
      const note = createNoteDefinition(solfege, 3)
      expect(note.solfege).toBe(solfege)
      expect(note.frequency).toBe(getNoteFrequency(solfege, 3))
      expect(note.staffPosition).toBe(getStaffPosition(solfege, 3))
      expect(note.octave).toBe(3)
    })
  })
})

describe('getAllSolfegeNotes', () => {
  it('returns all seven solfege notes', () => {
    const notes = getAllSolfegeNotes()
    expect(notes).toHaveLength(7)
    expect(notes).toContain('do')
    expect(notes).toContain('re')
    expect(notes).toContain('mi')
    expect(notes).toContain('fa')
    expect(notes).toContain('sol')
    expect(notes).toContain('la')
    expect(notes).toContain('si')
  })
})

describe('getSolfegeFromString', () => {
  it('returns correct solfege for each guitar string', () => {
    expect(getSolfegeFromString(6)).toBe('mi')
    expect(getSolfegeFromString(5)).toBe('la')
    expect(getSolfegeFromString(4)).toBe('re')
    expect(getSolfegeFromString(3)).toBe('sol')
    expect(getSolfegeFromString(2)).toBe('si')
    expect(getSolfegeFromString(1)).toBe('mi')
  })
})

describe('getOctaveFromString', () => {
  it('returns correct octave for each guitar string', () => {
    expect(getOctaveFromString(6)).toBe(3)
    expect(getOctaveFromString(5)).toBe(3)
    expect(getOctaveFromString(4)).toBe(3)
    expect(getOctaveFromString(3)).toBe(3)
    expect(getOctaveFromString(2)).toBe(3)
    expect(getOctaveFromString(1)).toBe(4)
  })
})

describe('getAllGuitarStrings', () => {
  it('returns all six guitar strings', () => {
    const strings = getAllGuitarStrings()
    expect(strings).toHaveLength(6)
    expect(strings).toEqual([6, 5, 4, 3, 2, 1])
  })
})

describe('getNotesFromStrings', () => {
  it('returns unique solfege notes from selected strings', () => {
    const strings: GuitarString[] = [6, 5, 4, 3, 2, 1]
    const notes = getNotesFromStrings(strings)
    expect(notes).toContain('mi')
    expect(notes).toContain('la')
    expect(notes).toContain('re')
    expect(notes).toContain('sol')
    expect(notes).toContain('si')
    expect(notes.length).toBe(5)
  })

  it('returns correct notes for single string', () => {
    expect(getNotesFromStrings([6])).toEqual(['mi'])
    expect(getNotesFromStrings([5])).toEqual(['la'])
    expect(getNotesFromStrings([1])).toEqual(['mi'])
  })
})

describe('Note accuracy - string to note mapping', () => {
  it('creates notes from strings with correct frequencies and positions', () => {
    const stringMappings: Array<{
      string: GuitarString
      expectedSolfege: SolfegeNote
      expectedOctave: 3 | 4
    }> = [
      { string: 6, expectedSolfege: 'mi', expectedOctave: 3 },
      { string: 5, expectedSolfege: 'la', expectedOctave: 3 },
      { string: 4, expectedSolfege: 're', expectedOctave: 3 },
      { string: 3, expectedSolfege: 'sol', expectedOctave: 3 },
      { string: 2, expectedSolfege: 'si', expectedOctave: 3 },
      { string: 1, expectedSolfege: 'mi', expectedOctave: 4 },
    ]

    stringMappings.forEach(({ string, expectedSolfege, expectedOctave }) => {
      const solfege = getSolfegeFromString(string)
      const octave = getOctaveFromString(string)
      const note = createNoteDefinition(solfege, octave)

      expect(solfege).toBe(expectedSolfege)
      expect(octave).toBe(expectedOctave)
      expect(note.solfege).toBe(expectedSolfege)
      expect(note.octave).toBe(expectedOctave)
      expect(note.frequency).toBe(getNoteFrequency(expectedSolfege, expectedOctave))
      expect(note.staffPosition).toBe(getStaffPosition(expectedSolfege, expectedOctave))
    })
  })
})
