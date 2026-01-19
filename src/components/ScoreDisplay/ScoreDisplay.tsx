import { useTranslation } from 'react-i18next'

interface ScoreDisplayProps {
  correct: number
  total: number
}

export function ScoreDisplay({ correct, total }: ScoreDisplayProps) {
  const { t } = useTranslation()

  return (
    <div className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-primary/10 to-indigo-50/50 border-2 border-primary/20 rounded-xl p-5 md:p-6 shadow-soft">
      <span className="text-primary">{t('game.score', { correct, total })}</span>
    </div>
  )
}
