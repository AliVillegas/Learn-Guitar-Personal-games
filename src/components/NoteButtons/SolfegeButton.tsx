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
        'min-w-[80px] transition-all duration-300 ease-out',
        feedbackState === 'correct' &&
          'bg-[#198754] text-white border-[#198754] hover:bg-[#157347] hover:shadow-xl hover:scale-105 hover:-translate-y-1 active:scale-100 active:translate-y-0',
        feedbackState === 'incorrect' &&
          'bg-[#dc3545] text-white border-[#dc3545] hover:bg-[#bb2d3b] hover:shadow-xl animate-shake',
        feedbackState === 'idle' &&
          'hover:scale-105 hover:shadow-lg hover:border-blue-500 hover:-translate-y-0.5 active:scale-95 active:translate-y-0'
      )}
    >
      {t(`notes.${note}`)}
    </Button>
  )
}
