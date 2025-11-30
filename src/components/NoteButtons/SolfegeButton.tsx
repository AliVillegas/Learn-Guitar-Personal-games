import { useTranslation } from 'react-i18next'
import type { SolfegeNote } from '../../types/music'

interface SolfegeButtonProps {
  note: SolfegeNote
  onSelect: (note: SolfegeNote) => void
  disabled: boolean
  feedbackState: 'idle' | 'correct' | 'incorrect'
}

export function SolfegeButton({
  note,
  onSelect,
  disabled,
  feedbackState,
}: SolfegeButtonProps) {
  const { t } = useTranslation()

  const handleClick = () => {
    if (!disabled) {
      onSelect(note)
    }
  }

  const className = `solfege-button ${feedbackState} ${disabled ? 'disabled' : ''}`

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {t(`notes.${note}`)}
    </button>
  )
}

