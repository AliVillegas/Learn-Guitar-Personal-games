import { useTranslation } from 'react-i18next'
import { NoteSelector } from './NoteSelector'
import { StringSelector } from './StringSelector'
import { MeasureSelector } from './MeasureSelector'
import { Button } from '../ui/button'
import type { SolfegeNote, MeasureCount, GuitarString } from '../../types/music'

interface ConfigPanelProps {
  selectedNotes: SolfegeNote[]
  selectedStrings: GuitarString[]
  measureCount: MeasureCount
  onToggleNote: (note: SolfegeNote) => void
  onToggleString: (guitarString: GuitarString) => void
  onChangeMeasure: (count: MeasureCount) => void
  onGenerate: () => void
}

export function ConfigPanel({
  selectedNotes,
  selectedStrings,
  measureCount,
  onToggleNote,
  onToggleString,
  onChangeMeasure,
  onGenerate,
}: ConfigPanelProps) {
  const { t } = useTranslation()
  const canGenerate = selectedNotes.length >= 2 && selectedStrings.length > 0

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <NoteSelector selectedNotes={selectedNotes} onToggle={onToggleNote} />
      <StringSelector selectedStrings={selectedStrings} onToggle={onToggleString} />
      <MeasureSelector measureCount={measureCount} onChange={onChangeMeasure} />
      {selectedNotes.length < 2 && (
        <p className="text-sm text-destructive">{t('config.minNotesWarning')}</p>
      )}
      {selectedStrings.length === 0 && (
        <p className="text-sm text-destructive">{t('config.minStringsWarning')}</p>
      )}
      <Button onClick={onGenerate} disabled={!canGenerate} className="w-full" size="lg">
        {t('config.generate')}
      </Button>
    </div>
  )
}
