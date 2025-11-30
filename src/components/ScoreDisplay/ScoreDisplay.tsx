import { useTranslation } from 'react-i18next'

interface ScoreDisplayProps {
  correct: number
  total: number
}

export function ScoreDisplay({ correct, total }: ScoreDisplayProps) {
  const { t } = useTranslation()

  return (
    <div className="text-center text-xl font-semibold bg-card border border-border rounded-lg p-4">
      {t('game.score', { correct, total })}
    </div>
  )
}
