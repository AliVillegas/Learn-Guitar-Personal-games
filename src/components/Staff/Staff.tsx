import type { GameNote, MeasureCount } from '../../types/music'
import { StaffLines } from './StaffLines'
import { NotesContainer } from './NotesContainer'
import { MeasureBars } from './MeasureBars'

interface StaffProps {
  notes: GameNote[]
  measureCount: MeasureCount
  currentIndex: number
}

function calculateNoteWidth(totalNotes: number): number {
  return 100 / totalNotes
}

export function Staff({ notes, measureCount, currentIndex }: StaffProps) {
  const totalNotes = notes.length
  const noteWidth = calculateNoteWidth(totalNotes)

  return (
    <div className="staff-container">
      <div className="staff-header">
        <div className="treble-clef">𝄞</div>
        <div className="time-signature">
          <span className="time-top">4</span>
          <span className="time-bottom">4</span>
        </div>
      </div>
      <div className="staff-content">
        <StaffLines />
        <NotesContainer notes={notes} currentIndex={currentIndex} noteWidth={noteWidth} />
        <MeasureBars measureCount={measureCount} />
      </div>
    </div>
  )
}

