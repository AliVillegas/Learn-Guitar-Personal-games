import { useTranslation } from 'react-i18next'
import { StringSelector } from './StringSelector'
import { MeasureSelector } from './MeasureSelector'
import { InstrumentSelector } from './InstrumentSelector'
import { Button } from '../ui/button'
import type { MeasureCount, GuitarString, SolfegeNote } from '../../types/music'
import type { StringNoteConfig } from '../../types/game'
import type { InstrumentType } from '../../types/audio'

interface ConfigPanelProps {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
  onToggleStringNote: (guitarString: GuitarString, note: SolfegeNote) => void
  onChangeMeasure: (count: MeasureCount) => void
  onChangeInstrument: (instrument: InstrumentType) => void
  onGenerate: () => void
  hideMeasureSelector?: boolean
}

function hasAtLeastOneNote(stringNotes: StringNoteConfig[]): boolean {
  return stringNotes.some((sn) => sn.notes.length > 0)
}

export function ConfigPanel({
  stringNotes,
  measureCount,
  instrument,
  onToggleStringNote,
  onChangeMeasure,
  onChangeInstrument,
  onGenerate,
  hideMeasureSelector = false,
}: ConfigPanelProps) {
  const { t } = useTranslation()
  const canGenerate = hasAtLeastOneNote(stringNotes)

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <InstrumentSelector instrument={instrument} onChange={onChangeInstrument} />
      <StringSelector stringNotes={stringNotes} onToggleNote={onToggleStringNote} />
      {!hideMeasureSelector && (
        <MeasureSelector measureCount={measureCount} onChange={onChangeMeasure} />
      )}
      {!canGenerate && (
        <p className="text-sm text-destructive">{t('config.minStringNotesWarning')}</p>
      )}
      <Button onClick={onGenerate} disabled={!canGenerate} className="w-full" size="lg">
        {t('config.generate')}
      </Button>
    </div>
  )
}
