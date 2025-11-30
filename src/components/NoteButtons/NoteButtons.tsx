import { getAllSolfegeNotes } from '../../utils/notes'
import { SolfegeButton } from './SolfegeButton'
import type { SolfegeNote } from '../../types/music'

interface NoteButtonsProps {
  onSelect: (note: SolfegeNote) => void
  disabled: boolean
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>
}

export function NoteButtons({ onSelect, disabled, feedbackState }: NoteButtonsProps) {
  const allNotes = getAllSolfegeNotes()

  return (
    <div className="flex justify-center flex-wrap gap-3">
      {allNotes.map((note) => (
        <SolfegeButton
          key={note}
          note={note}
          onSelect={onSelect}
          disabled={disabled}
          feedbackState={feedbackState[note]}
        />
      ))}
    </div>
  )
}
