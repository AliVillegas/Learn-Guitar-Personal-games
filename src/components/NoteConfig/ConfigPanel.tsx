import { useTranslation } from 'react-i18next'
import { StringSelector } from './StringSelector'
import { MeasureSelector } from './MeasureSelector'
import { Button } from '../ui/button'
import type { MeasureCount, GuitarString, SolfegeNote } from '../../types/music'
import type { StringNoteConfig } from '../../types/game'

interface ConfigPanelProps {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  onToggleStringNote: (guitarString: GuitarString, note: SolfegeNote) => void
  onChangeMeasure: (count: MeasureCount) => void
  onGenerate: () => void
}

function hasAtLeastOneNote(stringNotes: StringNoteConfig[]): boolean {
  return stringNotes.some((sn) => sn.notes.length > 0)
}

export function ConfigPanel({
  stringNotes,
  measureCount,
  onToggleStringNote,
  onChangeMeasure,
  onGenerate,
}: ConfigPanelProps) {
  const { t } = useTranslation()
  const canGenerate = hasAtLeastOneNote(stringNotes)

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <StringSelector stringNotes={stringNotes} onToggleNote={onToggleStringNote} />
      <MeasureSelector measureCount={measureCount} onChange={onChangeMeasure} />
      {!canGenerate && (
        <p className="text-sm text-destructive">{t('config.minStringNotesWarning')}</p>
      )}
      <Button onClick={onGenerate} disabled={!canGenerate} className="w-full" size="lg">
        {t('config.generate')}
      </Button>
    </div>
  )
}
