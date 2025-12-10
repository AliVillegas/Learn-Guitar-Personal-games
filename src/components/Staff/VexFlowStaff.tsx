import { useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter, Dot, Stem } from 'vexflow'
import type {
  GameNote,
  MeasureCount,
  MultiVoiceGameNote,
  MultiVoiceMeasureCount,
  NoteDefinition,
  VoiceNote,
} from '../../types/music'

interface VexFlowStaffProps {
  notes: GameNote[] | MultiVoiceGameNote[]
  measureCount: MeasureCount | MultiVoiceMeasureCount
  currentIndex: number
}

const NOTE_MAP: Record<string, string> = {
  C3: 'c/3',
  D3: 'd/3',
  E3: 'e/3',
  F3: 'f/3',
  G3: 'g/3',
  A3: 'a/3',
  B3: 'b/3',
  C4: 'c/4',
  D4: 'd/4',
  E4: 'e/4',
  F4: 'f/4',
  G4: 'g/4',
  A4: 'a/4',
  B4: 'b/4',
  C5: 'c/5',
  D5: 'd/5',
  E5: 'e/5',
  F5: 'f/5',
  G5: 'g/5',
}

function isMultiVoiceNote(note: GameNote | MultiVoiceGameNote): note is MultiVoiceGameNote {
  return 'bassVoice' in note && 'melodyVoice' in note
}

function getVexFlowNote(note: GameNote): string {
  const key = `${note.note.letter}${note.note.octave}`
  return NOTE_MAP[key] || 'c/4'
}

function getNoteColor(note: GameNote | MultiVoiceGameNote, isActive: boolean): string {
  if (isActive) return '#4fc3f7'
  if (note.status === 'correct') return '#81c784'
  if (note.status === 'incorrect') return '#e57373'
  return '#2a2a2a'
}

function getVexFlowNoteFromDefinition(note: { letter: string; octave: number }): string {
  const key = `${note.letter}${note.octave}`
  return NOTE_MAP[key] || 'c/4'
}

function createStaveNotes(notes: GameNote[], currentIndex: number): StaveNote[] {
  return notes.map((gameNote, idx) => {
    const isActive = idx === currentIndex
    const vexNote = getVexFlowNote(gameNote)
    const color = getNoteColor(gameNote, isActive)

    const staveNote = new StaveNote({
      clef: 'treble',
      keys: [vexNote],
      duration: 'q',
    })

    staveNote.setStyle({ fillStyle: color, strokeStyle: color })
    return staveNote
  })
}

function createRestNote(): StaveNote {
  return new StaveNote({
    clef: 'treble',
    keys: ['b/4'],
    duration: 'qr',
  })
}

function addRestsToVoice(voice: Voice, restsNeeded: number): void {
  for (let i = 0; i < restsNeeded; i++) {
    const rest = createRestNote()
    rest.setStyle({ fillStyle: '#2a2a2a', strokeStyle: '#2a2a2a' })
    voice.addTickable(rest)
  }
}

function createVoiceWithNotes(measureNotes: StaveNote[]): Voice {
  const requiredBeats = 4
  const voice = new Voice({ num_beats: requiredBeats, beat_value: 4 })
  voice.addTickables(measureNotes)

  const actualBeats = measureNotes.length
  if (actualBeats < requiredBeats) {
    const restsNeeded = requiredBeats - actualBeats
    addRestsToVoice(voice, restsNeeded)
  }

  return voice
}

function createBassStaveNote(bassNoteDef: NoteDefinition, color: string): StaveNote {
  const bassVexNote = getVexFlowNoteFromDefinition(bassNoteDef)
  const bassStaveNote = new StaveNote({
    clef: 'treble',
    keys: [bassVexNote],
    duration: 'h',
    stem_direction: Stem.UP,
  })
  bassStaveNote.addModifier(new Dot(), 0)
  bassStaveNote.setStyle({ fillStyle: color, strokeStyle: color })
  return bassStaveNote
}

function createMelodyStaveNote(
  voiceNote: { note: NoteDefinition | null; duration: string },
  color: string
): StaveNote {
  if (voiceNote.note === null) {
    const rest = new StaveNote({
      clef: 'treble',
      keys: ['b/4'],
      duration: 'qr',
    })
    rest.setStyle({ fillStyle: color, strokeStyle: color })
    return rest
  }

  const melodyVexNote = getVexFlowNoteFromDefinition(voiceNote.note)
  const melodyStaveNote = new StaveNote({
    clef: 'treble',
    keys: [melodyVexNote],
    duration: 'q',
    stem_direction: Stem.UP,
  })
  melodyStaveNote.setStyle({ fillStyle: color, strokeStyle: color })
  return melodyStaveNote
}

function createStackedMelodyStaveNote(
  note1: NoteDefinition,
  note2: NoteDefinition,
  color: string
): StaveNote {
  const note1Vex = getVexFlowNoteFromDefinition(note1)
  const note2Vex = getVexFlowNoteFromDefinition(note2)
  const stackedStaveNote = new StaveNote({
    clef: 'treble',
    keys: [note1Vex, note2Vex],
    duration: 'q',
    stem_direction: Stem.UP,
  })
  stackedStaveNote.setStyle({ fillStyle: color, strokeStyle: color })
  return stackedStaveNote
}

function canStackMelodyNotes(voiceNote: VoiceNote, nextNote: VoiceNote): boolean {
  if (!voiceNote.note || !nextNote.note) return false
  return voiceNote.duration === 'q' && nextNote.duration === 'q'
}

function shouldStackMelodyNotes(
  voiceNote: VoiceNote,
  nextNote: VoiceNote | undefined,
  allowStacked: boolean
): boolean {
  if (!allowStacked || !nextNote) return false
  return canStackMelodyNotes(voiceNote, nextNote)
}

function createMelodyStaveNotesFromVoice(
  melodyVoice: VoiceNote[],
  allowStacked: boolean,
  color: string
): StaveNote[] {
  const melodyStaveNotes: StaveNote[] = []

  for (let i = 0; i < melodyVoice.length; i++) {
    const voiceNote = melodyVoice[i]

    if (voiceNote.note === null) {
      melodyStaveNotes.push(createMelodyStaveNote(voiceNote, color))
      continue
    }

    const nextNote = melodyVoice[i + 1]
    if (shouldStackMelodyNotes(voiceNote, nextNote, allowStacked)) {
      melodyStaveNotes.push(createStackedMelodyStaveNote(voiceNote.note, nextNote.note, color))
      i++
      continue
    }

    melodyStaveNotes.push(createMelodyStaveNote(voiceNote, color))
  }

  return melodyStaveNotes
}

function createMultiVoiceStaveNotes(
  multiVoiceNote: MultiVoiceGameNote,
  isActive: boolean
): { bassVoice: StaveNote; melodyVoice: StaveNote[] } {
  const color = getNoteColor(multiVoiceNote, isActive)

  const bassNoteDef = multiVoiceNote.bassVoice[0]?.note
  if (!bassNoteDef) {
    throw new Error('Bass voice must have a note')
  }
  const bassStaveNote = createBassStaveNote(bassNoteDef, color)

  const allowStacked = multiVoiceNote.allowStacked !== false
  const melodyStaveNotes = createMelodyStaveNotesFromVoice(
    multiVoiceNote.melodyVoice,
    allowStacked,
    color
  )

  return { bassVoice: bassStaveNote, melodyVoice: melodyStaveNotes }
}

function createStaveForMeasure(
  measureIndex: number,
  staveWidth: number,
  context: ReturnType<Renderer['getContext']>,
  yPosition: number,
  isFirstInRow: boolean
) {
  const xPosition = 50 + (measureIndex % 4) * staveWidth
  const staveActualWidth = staveWidth - 20
  const stave = new Stave(xPosition, yPosition, staveActualWidth)

  if (isFirstInRow) {
    stave.addClef('treble')
    stave.addTimeSignature('3/4')
  }

  stave.setContext(context).draw()
  return stave
}

function createVoiceObjects(bassVoice: StaveNote, melodyVoice: StaveNote[]) {
  const bassVoiceObj = new Voice({ num_beats: 3, beat_value: 4 })
  bassVoiceObj.setMode(Voice.Mode.SOFT)
  bassVoiceObj.addTickable(bassVoice)

  const melodyVoiceObj = new Voice({ num_beats: 3, beat_value: 4 })
  melodyVoiceObj.setMode(Voice.Mode.SOFT)
  melodyVoiceObj.addTickables(melodyVoice)

  return { bassVoiceObj, melodyVoiceObj }
}

function formatAndDrawVoices(
  bassVoiceObj: Voice,
  melodyVoiceObj: Voice,
  stave: Stave,
  bassVoice: StaveNote,
  melodyVoice: StaveNote[],
  context: ReturnType<Renderer['getContext']>
) {
  const formatter = new Formatter()
  formatter.formatToStave([bassVoiceObj, melodyVoiceObj], stave)

  bassVoice.setStemDirection(Stem.UP)
  melodyVoice.forEach((note) => {
    if (note.getAttribute('type') !== 'rest') {
      note.setStemDirection(Stem.UP)
    }
  })

  bassVoiceObj.draw(context, stave)
  melodyVoiceObj.draw(context, stave)
}

function renderMultiVoiceMeasure(
  context: ReturnType<Renderer['getContext']>,
  multiVoiceNote: MultiVoiceGameNote,
  measureIndex: number,
  staveWidth: number,
  isActive: boolean,
  yPosition: number,
  isFirstInRow: boolean
): void {
  const stave = createStaveForMeasure(measureIndex, staveWidth, context, yPosition, isFirstInRow)
  const { bassVoice, melodyVoice } = createMultiVoiceStaveNotes(multiVoiceNote, isActive)
  const { bassVoiceObj, melodyVoiceObj } = createVoiceObjects(bassVoice, melodyVoice)
  formatAndDrawVoices(bassVoiceObj, melodyVoiceObj, stave, bassVoice, melodyVoice, context)
}

function renderMeasure(
  context: ReturnType<Renderer['getContext']>,
  measureNotes: StaveNote[],
  measureIndex: number,
  staveWidth: number,
  yPosition: number,
  isFirstInRow: boolean
): void {
  if (measureNotes.length === 0) {
    return
  }

  const xPosition = 50 + (measureIndex % 4) * staveWidth
  const staveActualWidth = staveWidth - 20
  const stave = new Stave(xPosition, yPosition, staveActualWidth)

  if (isFirstInRow) {
    stave.addClef('treble')
    stave.addTimeSignature('4/4')
  }

  stave.setContext(context).draw()

  const voice = createVoiceWithNotes(measureNotes)
  const clefWidth = isFirstInRow ? 60 : 0
  const formatWidth = staveActualWidth - clefWidth - 10

  new Formatter().joinVoices([voice]).format([voice], formatWidth)
  voice.draw(context, stave)
}

function calculateMeasurePosition(measureIndex: number) {
  const measuresPerRow = 4
  const rowHeight = 180
  const initialY = 40
  const row = Math.floor(measureIndex / measuresPerRow)
  const yPosition = initialY + row * rowHeight
  const isFirstInRow = measureIndex % measuresPerRow === 0
  return { yPosition, isFirstInRow }
}

function renderMultiVoiceMeasures(
  context: ReturnType<Renderer['getContext']>,
  multiVoiceNotes: MultiVoiceGameNote[],
  measureCount: MeasureCount | MultiVoiceMeasureCount,
  currentIndex: number,
  staveWidth: number
): void {
  for (
    let measureIndex = 0;
    measureIndex < measureCount && measureIndex < multiVoiceNotes.length;
    measureIndex++
  ) {
    const { yPosition, isFirstInRow } = calculateMeasurePosition(measureIndex)
    const multiVoiceNote = multiVoiceNotes[measureIndex]
    const isActive = measureIndex === currentIndex
    renderMultiVoiceMeasure(
      context,
      multiVoiceNote,
      measureIndex,
      staveWidth,
      isActive,
      yPosition,
      isFirstInRow
    )
  }
}

function renderSingleNoteMeasures(
  context: ReturnType<Renderer['getContext']>,
  singleNotes: GameNote[],
  measureCount: MeasureCount,
  currentIndex: number,
  staveWidth: number
): void {
  const notesPerMeasure = 4
  const staveNotes = createStaveNotes(singleNotes, currentIndex)

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
    const startNoteIndex = measureIndex * notesPerMeasure
    const endNoteIndex = Math.min(startNoteIndex + notesPerMeasure, staveNotes.length)
    const measureNotes = staveNotes.slice(startNoteIndex, endNoteIndex)

    if (measureNotes.length === 0) break

    const { yPosition, isFirstInRow } = calculateMeasurePosition(measureIndex)
    renderMeasure(context, measureNotes, measureIndex, staveWidth, yPosition, isFirstInRow)
  }
}

function setupRenderer(
  container: HTMLDivElement,
  measureCount: MeasureCount | MultiVoiceMeasureCount
): ReturnType<Renderer['getContext']> {
  container.innerHTML = ''

  const renderer = new Renderer(container, Renderer.Backends.SVG)
  const staveWidth = 200
  const measuresPerRow = 4
  const rowHeight = 180
  const startOffset = 50
  const staveActualWidth = staveWidth - 20
  const padding = 20
  const rowsNeeded = Math.ceil(measureCount / measuresPerRow)
  const measuresInFirstRow = Math.min(measureCount, measuresPerRow)

  const totalWidth = Math.max(
    800,
    startOffset + measuresInFirstRow * staveWidth - (staveWidth - staveActualWidth) + padding
  )
  const totalHeight = 40 + rowsNeeded * rowHeight + 20

  renderer.resize(totalWidth, totalHeight)
  return renderer.getContext()
}

function renderStaff(
  container: HTMLDivElement,
  notes: GameNote[] | MultiVoiceGameNote[],
  measureCount: MeasureCount | MultiVoiceMeasureCount,
  currentIndex: number
): void {
  const context = setupRenderer(container, measureCount)
  const staveWidth = 200

  if (notes.length === 0) return

  if (isMultiVoiceNote(notes[0])) {
    renderMultiVoiceMeasures(
      context,
      notes as MultiVoiceGameNote[],
      measureCount,
      currentIndex,
      staveWidth
    )
  } else {
    renderSingleNoteMeasures(context, notes as GameNote[], measureCount, currentIndex, staveWidth)
  }
}

export function VexFlowStaff({ notes, measureCount, currentIndex }: VexFlowStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return

    const container = containerRef.current
    renderStaff(container, notes, measureCount, currentIndex)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [notes, measureCount, currentIndex])

  if (notes.length === 0) {
    return (
      <div className="w-full bg-card rounded-lg p-6 border border-border min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No notes to display</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-card rounded-lg p-6 border border-border overflow-auto">
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
