import type {
  GameNote,
  MultiVoiceGameNote,
  NoteDefinition,
  VoiceNote,
  NoteDuration,
} from '../types/music'

export interface TimedNote {
  note: NoteDefinition
  beatOffset: number
  durationInBeats: number
}

export function isMultiVoiceNote(note: GameNote | MultiVoiceGameNote): note is MultiVoiceGameNote {
  return 'melodyVoice' in note && 'bassVoice' in note
}

export function extractMelodyNotes(multiVoiceNote: MultiVoiceGameNote): NoteDefinition[] {
  return multiVoiceNote.melodyVoice
    .filter((vn) => vn.note !== null)
    .map((vn) => {
      if (vn.note === null) throw new Error('Note should not be null after filter')
      return vn.note
    })
}

function getDurationInBeats(duration: NoteDuration): number {
  switch (duration) {
    case 'h.':
      return 3
    case 'q':
      return 1
    case 'qr':
      return 1
    default:
      return 1
  }
}

function canStackNotes(voiceNote: VoiceNote, nextNote: VoiceNote): boolean {
  if (!voiceNote.note || !nextNote.note) return false
  const duration1 = getDurationInBeats(voiceNote.duration)
  const duration2 = getDurationInBeats(nextNote.duration)
  return duration1 === 1 && duration2 === 1
}

function shouldStackNotes(
  voiceNote: VoiceNote,
  nextNote: VoiceNote | undefined,
  allowStacked: boolean = true
): boolean {
  if (!allowStacked || !nextNote) return false
  return canStackNotes(voiceNote, nextNote)
}

function createStackedTimedNotes(
  voiceNote: VoiceNote,
  nextNote: VoiceNote,
  beatOffset: number
): TimedNote[] {
  if (!voiceNote.note || !nextNote.note) {
    throw new Error('Notes should not be null when creating stacked notes')
  }
  return [
    {
      note: voiceNote.note,
      beatOffset,
      durationInBeats: getDurationInBeats(voiceNote.duration),
    },
    {
      note: nextNote.note,
      beatOffset,
      durationInBeats: getDurationInBeats(nextNote.duration),
    },
  ]
}

function addNoteToTimedNotes(
  timedNotes: TimedNote[],
  voiceNote: VoiceNote,
  beatOffset: number,
  durationInBeats: number
): void {
  if (voiceNote.note !== null) {
    timedNotes.push({
      note: voiceNote.note,
      beatOffset,
      durationInBeats,
    })
  }
}

function processStackedNotes(
  timedNotes: TimedNote[],
  voiceNote: VoiceNote,
  nextNote: VoiceNote | undefined,
  currentBeat: number,
  allowStacked: boolean = true
): boolean {
  if (!shouldStackNotes(voiceNote, nextNote, allowStacked)) {
    return false
  }
  if (!nextNote) {
    throw new Error('Next note should exist when stacking')
  }
  timedNotes.push(...createStackedTimedNotes(voiceNote, nextNote, currentBeat))
  return true
}

function extractTimedNotesFromVoice(voice: VoiceNote[], allowStacked: boolean = true): TimedNote[] {
  const timedNotes: TimedNote[] = []
  let currentBeat = 0

  for (let i = 0; i < voice.length; i++) {
    const voiceNote = voice[i]
    const durationInBeats = getDurationInBeats(voiceNote.duration)

    if (voiceNote.note === null) {
      currentBeat += durationInBeats
      continue
    }

    const nextNote = voice[i + 1]
    const wasStacked = processStackedNotes(
      timedNotes,
      voiceNote,
      nextNote,
      currentBeat,
      allowStacked
    )
    if (wasStacked) {
      currentBeat += durationInBeats
      i++
      continue
    }

    addNoteToTimedNotes(timedNotes, voiceNote, currentBeat, durationInBeats)

    currentBeat += durationInBeats
  }

  return timedNotes
}

export function extractTimedNotesFromMultiVoice(multiVoiceNote: MultiVoiceGameNote): TimedNote[] {
  const allowStacked = multiVoiceNote.allowStacked !== false
  const bassNotes = extractTimedNotesFromVoice(multiVoiceNote.bassVoice, true)
  const melodyNotes = extractTimedNotesFromVoice(multiVoiceNote.melodyVoice, allowStacked)
  return [...bassNotes, ...melodyNotes]
}

export function extractAllNotesFromMultiVoice(
  multiVoiceNote: MultiVoiceGameNote
): NoteDefinition[] {
  const bassNotes = multiVoiceNote.bassVoice
    .filter((vn) => vn.note !== null)
    .map((vn) => {
      if (vn.note === null) throw new Error('Note should not be null after filter')
      return vn.note
    })

  const melodyNotes = multiVoiceNote.melodyVoice
    .filter((vn) => vn.note !== null)
    .map((vn) => {
      if (vn.note === null) throw new Error('Note should not be null after filter')
      return vn.note
    })

  return [...bassNotes, ...melodyNotes]
}

export function getNoteDefinitionsFromSequence(
  sequence: (GameNote | MultiVoiceGameNote)[]
): NoteDefinition[] {
  if (sequence.length === 0) return []
  if (isMultiVoiceNote(sequence[0])) {
    return (sequence as MultiVoiceGameNote[]).flatMap(extractAllNotesFromMultiVoice)
  }
  return (sequence as GameNote[]).map((gn) => gn.note)
}

export function getChordGroupsFromSequence(
  sequence: (GameNote | MultiVoiceGameNote)[]
): NoteDefinition[][] {
  if (sequence.length === 0) return []
  if (isMultiVoiceNote(sequence[0])) {
    return (sequence as MultiVoiceGameNote[]).map(extractAllNotesFromMultiVoice)
  }
  return (sequence as GameNote[]).map((gn) => [gn.note])
}

export function getTimedNotesFromSequence(
  sequence: (GameNote | MultiVoiceGameNote)[]
): TimedNote[][] {
  if (sequence.length === 0) return []
  if (isMultiVoiceNote(sequence[0])) {
    return (sequence as MultiVoiceGameNote[]).map(extractTimedNotesFromMultiVoice)
  }
  return (sequence as GameNote[]).map((gn) => [
    { note: gn.note, beatOffset: 0, durationInBeats: 1 },
  ])
}

export function getCurrentNoteDefinition(
  currentNote: GameNote | MultiVoiceGameNote
): NoteDefinition | null {
  if (isMultiVoiceNote(currentNote)) {
    const melodyNotes = extractMelodyNotes(currentNote)
    return melodyNotes.length > 0 ? melodyNotes[0] : null
  }
  return currentNote.note
}
