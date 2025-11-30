import { useTranslation } from 'react-i18next'
import { NoteSelector } from './NoteSelector'
import { MeasureSelector } from './MeasureSelector'
import type { SolfegeNote, MeasureCount } from '../../types/music'

interface ConfigPanelProps {
  selectedNotes: SolfegeNote[]
  measureCount: MeasureCount
  onToggleNote: (note: SolfegeNote) => void
  onChangeMeasure: (count: MeasureCount) => void
  onGenerate: () => void
}

export function ConfigPanel({
  selectedNotes,
  measureCount,
  onToggleNote,
  onChangeMeasure,
  onGenerate,
}: ConfigPanelProps) {
  const { t } = useTranslation()
  const canGenerate = selectedNotes.length >= 2

  return (
    <div className="config-panel">
      <NoteSelector selectedNotes={selectedNotes} onToggle={onToggleNote} />
      <MeasureSelector measureCount={measureCount} onChange={onChangeMeasure} />
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="generate-button"
      >
        {t('config.generate')}
      </button>
    </div>
  )
}

