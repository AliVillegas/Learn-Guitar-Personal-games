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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t('config.selectNotes')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {allNotes.map((note) => (
          <NoteCheckbox
            key={note}
            note={note}
            checked={selectedNotes.includes(note)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
