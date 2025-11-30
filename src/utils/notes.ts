import type { SolfegeNote, NoteDefinition, LetterNote, GuitarString } from '../types/music'

const NOTE_FREQUENCIES: Record<string, number> = {
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  B2: 123.47,
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
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
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
    { position: 9, octave: 5 },
  ],
  re: [
    { position: -4, octave: 3 },
    { position: 3, octave: 4 },
    { position: 10, octave: 5 },
  ],
  mi: [
    { position: 0, octave: 3 },
    { position: 4, octave: 4 },
    { position: 11, octave: 5 },
  ],
  fa: [
    { position: 1, octave: 3 },
    { position: 5, octave: 4 },
    { position: 12, octave: 5 },
  ],
  sol: [
    { position: -1, octave: 3 },
    { position: 6, octave: 4 },
    { position: 13, octave: 5 },
  ],
  la: [
    { position: -2, octave: 3 },
    { position: 7, octave: 4 },
  ],
  si: [
    { position: -3, octave: 3 },
    { position: 8, octave: 4 },
  ],
}

export function getNoteFrequency(solfege: SolfegeNote, octave: 3 | 4 | 5): number {
  const letter = SOLFEGE_TO_LETTER[solfege]
  const key = `${letter}${octave}`
  return NOTE_FREQUENCIES[key] || 220.0
}

export function getGuitarSoundingFrequency(solfege: SolfegeNote, writtenOctave: 3 | 4 | 5): number {
  const soundingOctave = (writtenOctave - 1) as 2 | 3 | 4
  const letter = SOLFEGE_TO_LETTER[solfege]
  const key = `${letter}${soundingOctave}`
  return NOTE_FREQUENCIES[key] || getNoteFrequency(solfege, writtenOctave) / 2
}

export function getStaffPosition(solfege: SolfegeNote, octave: 3 | 4 | 5): number {
  const positions = STAFF_POSITIONS[solfege]
  const match = positions.find((p) => p.octave === octave)
  return match ? match.position : positions[0].position
}

export function createNoteDefinition(solfege: SolfegeNote, octave: 3 | 4 | 5 = 3): NoteDefinition {
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

const STRING_NOTES: Record<GuitarString, Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }>> = {
  6: [
    { solfege: 'mi', octave: 3 },
    { solfege: 'fa', octave: 3 },
    { solfege: 'sol', octave: 3 },
  ],
  5: [
    { solfege: 'la', octave: 3 },
    { solfege: 'si', octave: 3 },
    { solfege: 'do', octave: 4 },
  ],
  4: [
    { solfege: 're', octave: 4 },
    { solfege: 'mi', octave: 4 },
    { solfege: 'fa', octave: 4 },
  ],
  3: [
    { solfege: 'sol', octave: 4 },
    { solfege: 'la', octave: 4 },
  ],
  2: [
    { solfege: 'si', octave: 4 },
    { solfege: 'do', octave: 5 },
    { solfege: 're', octave: 5 },
  ],
  1: [
    { solfege: 'mi', octave: 5 },
    { solfege: 'fa', octave: 5 },
    { solfege: 'sol', octave: 5 },
  ],
}

export function getNotesForString(
  guitarString: GuitarString
): Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> {
  return STRING_NOTES[guitarString]
}

export function getSolfegeFromString(guitarString: GuitarString): SolfegeNote {
  return STRING_NOTES[guitarString][0].solfege
}

export function getOctaveFromString(guitarString: GuitarString): 3 | 4 | 5 {
  return STRING_NOTES[guitarString][0].octave
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
