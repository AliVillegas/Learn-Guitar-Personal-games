import { useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow'
import type { GameNote, MeasureCount } from '../../types/music'

interface VexFlowStaffProps {
  notes: GameNote[]
  measureCount: MeasureCount
  currentIndex: number
}

const NOTE_MAP: Record<string, string> = {
  C3: 'c/4',
  D3: 'd/4',
  E3: 'e/4',
  F3: 'f/4',
  G3: 'g/4',
  A3: 'a/4',
  B3: 'b/4',
  C4: 'c/5',
  D4: 'd/5',
  E4: 'e/5',
  F4: 'f/5',
  G4: 'g/5',
}

function getVexFlowNote(note: GameNote): string {
  const key = `${note.note.letter}${note.note.octave}`
  return NOTE_MAP[key] || 'c/4'
}

function getNoteColor(note: GameNote, isActive: boolean): string {
  if (isActive) return '#4fc3f7'
  if (note.status === 'correct') return '#81c784'
  if (note.status === 'incorrect') return '#e57373'
  return '#2a2a2a'
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

function renderMeasure(
  context: ReturnType<Renderer['getContext']>,
  measureNotes: StaveNote[],
  measureIndex: number,
  staveWidth: number
): void {
  const xPosition = 50 + measureIndex * staveWidth
  const staveActualWidth = staveWidth - 20
  const stave = new Stave(xPosition, 40, staveActualWidth)

  if (measureIndex === 0) {
    stave.addClef('treble')
    stave.addTimeSignature('4/4')
  }

  stave.setContext(context).draw()

  const voice = new Voice({ num_beats: measureNotes.length, beat_value: 4 })
  voice.addTickables(measureNotes)

  const clefWidth = measureIndex === 0 ? 60 : 0
  const formatWidth = staveActualWidth - clefWidth - 10

  new Formatter().joinVoices([voice]).format([voice], formatWidth)

  voice.draw(context, stave)
}

function renderStaff(
  container: HTMLDivElement,
  notes: GameNote[],
  measureCount: MeasureCount,
  currentIndex: number
): void {
  container.innerHTML = ''

  const renderer = new Renderer(container, Renderer.Backends.SVG)
  const staveWidth = 200
  const startOffset = 50
  const staveActualWidth = staveWidth - 20
  const padding = 20
  const totalWidth = Math.max(
    800,
    startOffset + measureCount * staveWidth - (staveWidth - staveActualWidth) + padding
  )
  renderer.resize(totalWidth, 200)
  const context = renderer.getContext()

  const notesPerMeasure = 4
  const staveNotes = createStaveNotes(notes, currentIndex)

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
    const startNoteIndex = measureIndex * notesPerMeasure
    const endNoteIndex = Math.min(startNoteIndex + notesPerMeasure, staveNotes.length)
    const measureNotes = staveNotes.slice(startNoteIndex, endNoteIndex)

    if (measureNotes.length === 0) break

    renderMeasure(context, measureNotes, measureIndex, staveWidth)
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
    <div className="w-full bg-card rounded-lg p-6 border border-border overflow-x-auto">
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
