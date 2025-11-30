import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface ResultPanelProps {
  correct: number
  total: number
  onPlayAgain: () => void
}

export function ResultPanel({ correct, total, onPlayAgain }: ResultPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center">
      <h2 className="text-3xl font-semibold text-[#0d6efd]">{t('result.complete')}</h2>
      <p className="text-lg text-muted-foreground">{t('result.finalScore', { correct, total })}</p>
      <Button onClick={onPlayAgain} size="lg" variant="default">
        {t('result.playAgain')}
      </Button>
    </div>
  )
}
