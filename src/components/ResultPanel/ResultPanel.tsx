import { useTranslation } from 'react-i18next'

interface ResultPanelProps {
  correct: number
  total: number
  onPlayAgain: () => void
}

export function ResultPanel({ correct, total, onPlayAgain }: ResultPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="result-panel">
      <h2>{t('result.complete')}</h2>
      <p>{t('result.finalScore', { correct, total })}</p>
      <button type="button" onClick={onPlayAgain} className="play-again-button">
        {t('result.playAgain')}
      </button>
    </div>
  )
}

