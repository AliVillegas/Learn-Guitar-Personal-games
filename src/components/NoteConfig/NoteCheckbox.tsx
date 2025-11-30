import { useTranslation } from 'react-i18next'
import type { SolfegeNote } from '../../types/music'

interface NoteCheckboxProps {
  note: SolfegeNote
  checked: boolean
  onToggle: (note: SolfegeNote) => void
}

export function NoteCheckbox({ note, checked, onToggle }: NoteCheckboxProps) {
  const { t } = useTranslation()

  const handleChange = () => {
    onToggle(note)
  }

  return (
    <label className="note-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
      />
      <span>{t(`notes.${note}`)}</span>
    </label>
  )
}

