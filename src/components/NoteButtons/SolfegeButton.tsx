import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import type { SolfegeNote } from '../../types/music'

interface SolfegeButtonProps {
  note: SolfegeNote
  onSelect: (note: SolfegeNote) => void
  disabled: boolean
  feedbackState: 'idle' | 'correct' | 'incorrect'
}

function getVariant(feedbackState: 'idle' | 'correct' | 'incorrect') {
  if (feedbackState === 'correct') return 'default'
  if (feedbackState === 'incorrect') return 'destructive'
  return 'outline'
}

export function SolfegeButton({ note, onSelect, disabled, feedbackState }: SolfegeButtonProps) {
  const { t } = useTranslation()

  const handleClick = () => {
    if (!disabled) {
      onSelect(note)
    }
  }

  const variant = getVariant(feedbackState)

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      variant={variant}
      className={cn(
        'min-w-[80px] transition-all duration-200',
        feedbackState === 'correct' && 'bg-green-300 hover:bg-green-400',
        feedbackState === 'incorrect' && 'animate-shake'
      )}
    >
      {t(`notes.${note}`)}
    </Button>
  )
}
