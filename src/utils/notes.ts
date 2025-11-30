import type { SolfegeNote, NoteDefinition, LetterNote, GuitarString } from '../types/music'

const NOTE_FREQUENCIES: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
}

const SOLFEGE_TO_LETTER: Record<SolfegeNote, LetterNote> = {
  do: 'C',
  re: 'D',
  mi: 'E',
  fa: 'F',
  sol: 'G',
  la: 'A',
  si: 'B',
}

const STAFF_POSITIONS: Record<SolfegeNote, { position: number; octave: number }[]> = {
  do: [
    { position: -5, octave: 3 },
    { position: 2, octave: 4 },
  ],
  re: [
    { position: -4, octave: 3 },
    { position: 3, octave: 4 },
  ],
  mi: [
    { position: -3, octave: 3 },
    { position: 4, octave: 4 },
  ],
  fa: [
    { position: -2, octave: 3 },
    { position: 5, octave: 4 },
  ],
  sol: [
    { position: -1, octave: 3 },
    { position: 6, octave: 4 },
  ],
  la: [{ position: 0, octave: 3 }],
  si: [{ position: 1, octave: 3 }],
}

export function getNoteFrequency(solfege: SolfegeNote, octave: 3 | 4): number {
  const letter = SOLFEGE_TO_LETTER[solfege]
  const key = `${letter}${octave}`
  return NOTE_FREQUENCIES[key] || 220.0
}

export function getStaffPosition(solfege: SolfegeNote, octave: 3 | 4): number {
  const positions = STAFF_POSITIONS[solfege]
  const match = positions.find((p) => p.octave === octave)
  return match ? match.position : positions[0].position
}

export function createNoteDefinition(solfege: SolfegeNote, octave: 3 | 4 = 3): NoteDefinition {
  const letter = SOLFEGE_TO_LETTER[solfege]
  const frequency = getNoteFrequency(solfege, octave)
  const staffPosition = getStaffPosition(solfege, octave)

  return {
    solfege,
    letter,
    frequency,
    staffPosition,
    octave,
  }
}

export function getAllSolfegeNotes(): SolfegeNote[] {
  return ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']
}

const STRING_TO_SOLFEGE: Record<GuitarString, SolfegeNote> = {
  6: 'mi',
  5: 'la',
  4: 're',
  3: 'sol',
  2: 'si',
  1: 'mi',
}

const STRING_TO_OCTAVE: Record<GuitarString, 3 | 4> = {
  6: 3,
  5: 3,
  4: 3,
  3: 3,
  2: 3,
  1: 4,
}

export function getSolfegeFromString(guitarString: GuitarString): SolfegeNote {
  return STRING_TO_SOLFEGE[guitarString]
}

export function getOctaveFromString(guitarString: GuitarString): 3 | 4 {
  return STRING_TO_OCTAVE[guitarString]
}

export function getAllGuitarStrings(): GuitarString[] {
  return [6, 5, 4, 3, 2, 1]
}

export function getNotesFromStrings(strings: GuitarString[]): SolfegeNote[] {
  const notes = new Set<SolfegeNote>()
  strings.forEach((str) => {
    notes.add(getSolfegeFromString(str))
  })
  return Array.from(notes)
}
