import type { GameNote } from '../../types/music'
import { needsLedgerLine, getStemDirection } from '../../utils/staffPositions'

interface QuarterNoteProps {
  note: GameNote
  isActive: boolean
  horizontalPosition: number
}

export function QuarterNote({ note, isActive, horizontalPosition }: QuarterNoteProps) {
  const position = note.note.staffPosition
  const hasLedger = needsLedgerLine(position)
  const stemDirection = getStemDirection(position)
  const statusClass = note.status

  const noteStyle = {
    left: `${horizontalPosition}%`,
    transform: `translateY(calc(${position} * var(--line-spacing) * -0.5))`,
  }

  return (
    <div className={`quarter-note ${statusClass} ${isActive ? 'active' : ''}`} style={noteStyle}>
      {hasLedger && <div className="ledger-line" />}
      <div className="note-head" />
      <div className={`note-stem ${stemDirection}`} />
    </div>
  )
}
