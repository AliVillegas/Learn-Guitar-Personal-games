import type { GameNote } from '../../types/music'
import { QuarterNote } from './QuarterNote'

interface NotesContainerProps {
  notes: GameNote[]
  currentIndex: number
  noteWidth: number
}

export function NotesContainer({ notes, currentIndex, noteWidth }: NotesContainerProps) {
  return (
    <div className="notes-container">
      {notes.map((note, index) => {
        const horizontalPosition = (index + 0.5) * noteWidth
        const isActive = index === currentIndex
        return (
          <QuarterNote
            key={note.id}
            note={note}
            isActive={isActive}
            horizontalPosition={horizontalPosition}
          />
        )
      })}
    </div>
  )
}
