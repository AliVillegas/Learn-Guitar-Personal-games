import { useTranslation } from 'react-i18next'
import { getAllSolfegeNotes } from '../../utils/notes'
import { NoteCheckbox } from './NoteCheckbox'
import type { SolfegeNote } from '../../types/music'

interface NoteSelectorProps {
  selectedNotes: SolfegeNote[]
  onToggle: (note: SolfegeNote) => void
}

export function NoteSelector({ selectedNotes, onToggle }: NoteSelectorProps) {
  const { t } = useTranslation()
  const allNotes = getAllSolfegeNotes()

  return (
    <div className="note-selector">
      <h3>{t('config.selectNotes')}</h3>
      <div className="note-checkboxes">
        {allNotes.map((note) => (
          <NoteCheckbox
            key={note}
            note={note}
            checked={selectedNotes.includes(note)}
            onToggle={onToggle}
          />
        ))}
      </div>
      {selectedNotes.length < 2 && (
        <p className="warning">{t('config.minNotesWarning')}</p>
      )}
    </div>
  )
}

