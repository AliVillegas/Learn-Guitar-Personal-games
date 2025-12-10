import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface ResultPanelProps {
  correct: number
  total: number
  onPlayAgain: () => void
  onGoToConfig: () => void
  onGoToHome?: () => void
}

export function ResultPanel({
  correct,
  total,
  onPlayAgain,
  onGoToConfig,
  onGoToHome,
}: ResultPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center">
      <h2 className="text-3xl font-semibold text-[#0d6efd]">{t('result.complete')}</h2>
      <p className="text-lg text-muted-foreground">{t('result.finalScore', { correct, total })}</p>
      <div className="flex gap-4 justify-center">
        {onGoToHome && (
          <Button onClick={onGoToHome} size="lg" variant="outline">
            {t('app.backToHome')}
          </Button>
        )}
        <Button onClick={onGoToConfig} size="lg" variant="outline">
          {t('result.goToConfig')}
        </Button>
        <Button onClick={onPlayAgain} size="lg" variant="default">
          {t('result.playAgain')}
        </Button>
      </div>
    </div>
  )
}
