import { useTranslation } from 'react-i18next'
import { NoteSelector } from './NoteSelector'
import { MeasureSelector } from './MeasureSelector'
import { Button } from '../ui/button'
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
    <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
      <NoteSelector selectedNotes={selectedNotes} onToggle={onToggleNote} />
      <MeasureSelector measureCount={measureCount} onChange={onChangeMeasure} />
      {selectedNotes.length < 2 && (
        <p className="text-sm text-destructive">{t('config.minNotesWarning')}</p>
      )}
      <Button onClick={onGenerate} disabled={!canGenerate} className="w-full" size="lg">
        {t('config.generate')}
      </Button>
    </div>
  )
}
