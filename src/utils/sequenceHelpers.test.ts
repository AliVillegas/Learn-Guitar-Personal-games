import { describe, it, expect } from 'vitest'
import {
  isMultiVoiceNote,
  extractMelodyNotes,
  extractTimedNotesFromMultiVoice,
  extractAllNotesFromMultiVoice,
  getNoteDefinitionsFromSequence,
  getChordGroupsFromSequence,
  getTimedNotesFromSequence,
  getCurrentNoteDefinition,
} from './sequenceHelpers'
import { createNoteDefinition } from './notes'
import type { GameNote, MultiVoiceGameNote } from '../types/music'

describe('sequenceHelpers', () => {
  describe('isMultiVoiceNote', () => {
    it('returns true for multi-voice notes', () => {
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [],
        status: 'pending',
      }
      expect(isMultiVoiceNote(multiVoiceNote)).toBe(true)
    })

    it('returns false for single notes', () => {
      const singleNote: GameNote = {
        id: '1',
        note: createNoteDefinition('do', 3),
        status: 'pending',
      }
      expect(isMultiVoiceNote(singleNote)).toBe(false)
    })
  })

  describe('extractMelodyNotes', () => {
    it('extracts melody notes from multi-voice note', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: doNote, duration: 'q' },
          { note: null, duration: 'q' },
          { note: reNote, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = extractMelodyNotes(multiVoiceNote)
      expect(result).toEqual([doNote, reNote])
    })

    it('filters out null notes', () => {
      const doNote = createNoteDefinition('do', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: null, duration: 'q' },
          { note: doNote, duration: 'q' },
          { note: null, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = extractMelodyNotes(multiVoiceNote)
      expect(result).toEqual([doNote])
    })

    it('returns empty array when all notes are null', () => {
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: null, duration: 'q' },
          { note: null, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = extractMelodyNotes(multiVoiceNote)
      expect(result).toEqual([])
    })
  })

  describe('extractTimedNotesFromMultiVoice', () => {
    it('extracts timed notes from multi-voice note', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const faNote = createNoteDefinition('fa', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [
          { note: faNote, duration: 'q' },
          { note: null, duration: 'q' },
        ],
        melodyVoice: [
          { note: doNote, duration: 'q' },
          { note: reNote, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = extractTimedNotesFromMultiVoice(multiVoiceNote)
      expect(result).toHaveLength(3)
      expect(result[0].note).toEqual(faNote)
      expect(result[0].beatOffset).toBe(0)
      expect(result[1].note).toEqual(doNote)
      expect(result[1].beatOffset).toBe(0)
      expect(result[2].note).toEqual(reNote)
      expect(result[2].beatOffset).toBeGreaterThanOrEqual(0)
    })

    it('handles stacked notes when allowStacked is true', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: doNote, duration: 'q' },
          { note: reNote, duration: 'q' },
        ],
        status: 'pending',
        allowStacked: true,
      }
      const result = extractTimedNotesFromMultiVoice(multiVoiceNote)
      expect(result).toHaveLength(2)
      expect(result[0].note).toEqual(doNote)
      expect(result[0].beatOffset).toBe(0)
      expect(result[1].note).toEqual(reNote)
      expect(result[1].beatOffset).toBe(0)
    })

    it('does not stack notes when allowStacked is false', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: doNote, duration: 'q' },
          { note: reNote, duration: 'q' },
        ],
        status: 'pending',
        allowStacked: false,
      }
      const result = extractTimedNotesFromMultiVoice(multiVoiceNote)
      expect(result).toHaveLength(2)
      expect(result[0].beatOffset).toBe(0)
      expect(result[1].beatOffset).toBe(1)
    })

    it('handles half-dotted notes correctly', () => {
      const doNote = createNoteDefinition('do', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [{ note: doNote, duration: 'h.' }],
        status: 'pending',
      }
      const result = extractTimedNotesFromMultiVoice(multiVoiceNote)
      expect(result).toHaveLength(1)
      expect(result[0].durationInBeats).toBe(3)
    })

    it('skips null notes in voice', () => {
      const doNote = createNoteDefinition('do', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: null, duration: 'q' },
          { note: doNote, duration: 'q' },
          { note: null, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = extractTimedNotesFromMultiVoice(multiVoiceNote)
      expect(result).toHaveLength(1)
      expect(result[0].note).toEqual(doNote)
      expect(result[0].beatOffset).toBe(1)
    })
  })

  describe('extractAllNotesFromMultiVoice', () => {
    it('extracts all notes from both voices', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const faNote = createNoteDefinition('fa', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [
          { note: faNote, duration: 'q' },
          { note: null, duration: 'q' },
        ],
        melodyVoice: [
          { note: doNote, duration: 'q' },
          { note: reNote, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = extractAllNotesFromMultiVoice(multiVoiceNote)
      expect(result).toEqual([faNote, doNote, reNote])
    })

    it('filters out null notes', () => {
      const doNote = createNoteDefinition('do', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [{ note: null, duration: 'q' }],
        melodyVoice: [{ note: doNote, duration: 'q' }],
        status: 'pending',
      }
      const result = extractAllNotesFromMultiVoice(multiVoiceNote)
      expect(result).toEqual([doNote])
    })
  })

  describe('getNoteDefinitionsFromSequence', () => {
    it('returns empty array for empty sequence', () => {
      expect(getNoteDefinitionsFromSequence([])).toEqual([])
    })

    it('extracts notes from single-note sequence', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const sequence: GameNote[] = [
        { id: '1', note: doNote, status: 'pending' },
        { id: '2', note: reNote, status: 'pending' },
      ]
      const result = getNoteDefinitionsFromSequence(sequence)
      expect(result).toEqual([doNote, reNote])
    })

    it('extracts all notes from multi-voice sequence', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const faNote = createNoteDefinition('fa', 3)
      const sequence: MultiVoiceGameNote[] = [
        {
          id: '1',
          bassVoice: [{ note: faNote, duration: 'q' }],
          melodyVoice: [{ note: doNote, duration: 'q' }],
          status: 'pending',
        },
        {
          id: '2',
          bassVoice: [],
          melodyVoice: [{ note: reNote, duration: 'q' }],
          status: 'pending',
        },
      ]
      const result = getNoteDefinitionsFromSequence(sequence)
      expect(result).toEqual([faNote, doNote, reNote])
    })
  })

  describe('getChordGroupsFromSequence', () => {
    it('returns empty array for empty sequence', () => {
      expect(getChordGroupsFromSequence([])).toEqual([])
    })

    it('returns single-note groups for single-note sequence', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const sequence: GameNote[] = [
        { id: '1', note: doNote, status: 'pending' },
        { id: '2', note: reNote, status: 'pending' },
      ]
      const result = getChordGroupsFromSequence(sequence)
      expect(result).toEqual([[doNote], [reNote]])
    })

    it('returns chord groups for multi-voice sequence', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const faNote = createNoteDefinition('fa', 3)
      const sequence: MultiVoiceGameNote[] = [
        {
          id: '1',
          bassVoice: [{ note: faNote, duration: 'q' }],
          melodyVoice: [{ note: doNote, duration: 'q' }],
          status: 'pending',
        },
        {
          id: '2',
          bassVoice: [],
          melodyVoice: [{ note: reNote, duration: 'q' }],
          status: 'pending',
        },
      ]
      const result = getChordGroupsFromSequence(sequence)
      expect(result).toEqual([[faNote, doNote], [reNote]])
    })
  })

  describe('getTimedNotesFromSequence', () => {
    it('returns empty array for empty sequence', () => {
      expect(getTimedNotesFromSequence([])).toEqual([])
    })

    it('returns timed notes for single-note sequence', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const sequence: GameNote[] = [
        { id: '1', note: doNote, status: 'pending' },
        { id: '2', note: reNote, status: 'pending' },
      ]
      const result = getTimedNotesFromSequence(sequence)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual([{ note: doNote, beatOffset: 0, durationInBeats: 1 }])
      expect(result[1]).toEqual([{ note: reNote, beatOffset: 0, durationInBeats: 1 }])
    })

    it('returns timed notes for multi-voice sequence', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const faNote = createNoteDefinition('fa', 3)
      const sequence: MultiVoiceGameNote[] = [
        {
          id: '1',
          bassVoice: [{ note: faNote, duration: 'q' }],
          melodyVoice: [{ note: doNote, duration: 'q' }],
          status: 'pending',
        },
        {
          id: '2',
          bassVoice: [],
          melodyVoice: [{ note: reNote, duration: 'q' }],
          status: 'pending',
        },
      ]
      const result = getTimedNotesFromSequence(sequence)
      expect(result).toHaveLength(2)
      expect(result[0].length).toBeGreaterThan(0)
      expect(result[1].length).toBeGreaterThan(0)
    })
  })

  describe('getCurrentNoteDefinition', () => {
    it('returns note for single-note game note', () => {
      const doNote = createNoteDefinition('do', 3)
      const gameNote: GameNote = {
        id: '1',
        note: doNote,
        status: 'active',
      }
      const result = getCurrentNoteDefinition(gameNote)
      expect(result).toEqual(doNote)
    })

    it('returns first melody note for multi-voice note', () => {
      const doNote = createNoteDefinition('do', 3)
      const reNote = createNoteDefinition('re', 3)
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: doNote, duration: 'q' },
          { note: reNote, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = getCurrentNoteDefinition(multiVoiceNote)
      expect(result).toEqual(doNote)
    })

    it('returns null when multi-voice note has no melody notes', () => {
      const multiVoiceNote: MultiVoiceGameNote = {
        id: '1',
        bassVoice: [],
        melodyVoice: [
          { note: null, duration: 'q' },
          { note: null, duration: 'q' },
        ],
        status: 'pending',
      }
      const result = getCurrentNoteDefinition(multiVoiceNote)
      expect(result).toBeNull()
    })
  })
})
