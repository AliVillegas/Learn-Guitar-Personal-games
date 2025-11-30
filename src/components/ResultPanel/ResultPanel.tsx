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
    <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center shadow-lg">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {t('result.complete')}
      </h2>
      <p className="text-lg text-muted-foreground">{t('result.finalScore', { correct, total })}</p>
      <Button onClick={onPlayAgain} size="lg" className="bg-accent hover:bg-accent/90">
        {t('result.playAgain')}
      </Button>
    </div>
  )
}
