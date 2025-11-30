import { useTranslation } from 'react-i18next'

interface ScoreDisplayProps {
  correct: number
  total: number
}

export function ScoreDisplay({ correct, total }: ScoreDisplayProps) {
  const { t } = useTranslation()

  return (
    <div className="score-display">
      {t('game.score', { correct, total })}
    </div>
  )
}

