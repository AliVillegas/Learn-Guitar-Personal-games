import { useTranslation } from 'react-i18next'
import { Checkbox } from '../ui/checkbox'
import { cn } from '@/lib/utils'
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
    <label
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg border border-border',
        'hover:bg-accent/50 cursor-pointer transition-colors',
        checked && 'bg-primary/20 border-primary'
      )}
    >
      <Checkbox checked={checked} onChange={handleChange} />
      <span className="text-sm font-medium">{t(`notes.${note}`)}</span>
    </label>
  )
}
