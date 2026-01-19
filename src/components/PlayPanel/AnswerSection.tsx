import { useTranslation } from 'react-i18next'
import { NoteButtons } from '../NoteButtons/NoteButtons'
import type { SolfegeNote } from '../../types/music'

interface AnswerSectionProps {
  isPlayingAudio: boolean
  feedbackState: Record<SolfegeNote, 'idle' | 'correct' | 'incorrect'>
  onAnswerSelect: (note: SolfegeNote) => void
}

export function AnswerSection({
  isPlayingAudio,
  feedbackState,
  onAnswerSelect,
}: AnswerSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <p className="text-center text-primary text-lg md:text-xl font-semibold">
        {t('game.identifyNote')}
      </p>
      <NoteButtons
        onSelect={onAnswerSelect}
        disabled={isPlayingAudio}
        feedbackState={feedbackState}
      />
    </div>
  )
}
