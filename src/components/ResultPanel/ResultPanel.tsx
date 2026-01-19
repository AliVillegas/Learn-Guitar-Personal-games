import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface ResultPanelProps {
  correct: number
  total: number
  onPlayAgain: () => void
  onGoToConfig: () => void
  onGoToHome?: () => void
}

function ResultContent({ correct, total }: { correct: number; total: number }) {
  const { t } = useTranslation()
  const percentage = Math.round((correct / total) * 100)

  return (
    <div className="space-y-4">
      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
        {t('result.complete')}
      </h2>
      <p className="text-xl md:text-2xl text-muted-foreground font-medium">
        {t('result.finalScore', { correct, total })}
      </p>
      <div className="inline-block px-6 py-2 bg-primary/10 rounded-full">
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>
    </div>
  )
}

function ResultActions({
  onPlayAgain,
  onGoToConfig,
  onGoToHome,
}: {
  onPlayAgain: () => void
  onGoToConfig: () => void
  onGoToHome?: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-4 justify-center">
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
  )
}

export function ResultPanel({
  correct,
  total,
  onPlayAgain,
  onGoToConfig,
  onGoToHome,
}: ResultPanelProps) {
  return (
    <div className="bg-card border-2 border-border rounded-xl p-8 md:p-12 space-y-8 text-center shadow-large">
      <ResultContent correct={correct} total={total} />
      <ResultActions
        onPlayAgain={onPlayAgain}
        onGoToConfig={onGoToConfig}
        onGoToHome={onGoToHome}
      />
    </div>
  )
}
