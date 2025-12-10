import type { GameNote, MultiVoiceGameNote, NoteDefinition } from '../../types/music'

export function isMultiVoiceNote(note: GameNote | MultiVoiceGameNote): note is MultiVoiceGameNote {
  return 'melodyVoice' in note && 'bassVoice' in note
}

export function getCurrentNoteDefinition(
  currentNote: GameNote | MultiVoiceGameNote
): NoteDefinition | null {
  if (isMultiVoiceNote(currentNote)) {
    const melodyNotes = currentNote.melodyVoice
      .filter((vn) => vn.note !== null)
      .map((vn) => {
        if (vn.note === null) throw new Error('Note should not be null after filter')
        return vn.note
      })
    return melodyNotes.length > 0 ? melodyNotes[0] : null
  }
  return currentNote.note
}

export function getNoteDefinitionsFromSequence(
  sequence: (GameNote | MultiVoiceGameNote)[]
): NoteDefinition[] {
  if (sequence.length === 0) return []
  if (isMultiVoiceNote(sequence[0])) {
    return (sequence as MultiVoiceGameNote[]).flatMap((mv) => {
      const bassNotes = mv.bassVoice
        .filter((vn) => vn.note !== null)
        .map((vn) => {
          if (vn.note === null) throw new Error('Note should not be null after filter')
          return vn.note
        })
      const melodyNotes = mv.melodyVoice
        .filter((vn) => vn.note !== null)
        .map((vn) => {
          if (vn.note === null) throw new Error('Note should not be null after filter')
          return vn.note
        })
      return [...bassNotes, ...melodyNotes]
    })
  }
  return (sequence as GameNote[]).map((gn) => gn.note)
}

export function calculateCorrectCount(notes: (GameNote | MultiVoiceGameNote)[]): number {
  return notes.filter((n) => n.status === 'correct').length
}
