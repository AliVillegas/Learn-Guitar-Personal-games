import { useTranslation } from 'react-i18next'
import { StringSelector } from './StringSelector'
import { MeasureSelector } from './MeasureSelector'
import { InstrumentSelector } from './InstrumentSelector'
import { AutoPlayToggle } from './AutoPlayToggle'
import { Button } from '../ui/button'
import type { MeasureCount, GuitarString, SolfegeNote } from '../../types/music'
import type { StringNoteConfig } from '../../types/game'
import type { InstrumentType } from '../../types/audio'

interface ConfigPanelProps {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
  autoPlayOnGenerate: boolean
  onToggleStringNote: (guitarString: GuitarString, note: SolfegeNote) => void
  onChangeMeasure: (count: MeasureCount) => void
  onChangeInstrument: (instrument: InstrumentType) => void
  onChangeAutoPlay: (autoPlay: boolean) => void
  onGenerate: () => void
}

function hasAtLeastOneNote(stringNotes: StringNoteConfig[]): boolean {
  return stringNotes.some((sn) => sn.notes.length > 0)
}

export function ConfigPanel({
  stringNotes,
  measureCount,
  instrument,
  autoPlayOnGenerate,
  onToggleStringNote,
  onChangeMeasure,
  onChangeInstrument,
  onChangeAutoPlay,
  onGenerate,
}: ConfigPanelProps) {
  const { t } = useTranslation()
  const canGenerate = hasAtLeastOneNote(stringNotes)

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <InstrumentSelector instrument={instrument} onChange={onChangeInstrument} />
      <StringSelector stringNotes={stringNotes} onToggleNote={onToggleStringNote} />
      <MeasureSelector measureCount={measureCount} onChange={onChangeMeasure} />
      <AutoPlayToggle checked={autoPlayOnGenerate} onChange={onChangeAutoPlay} />
      {!canGenerate && (
        <p className="text-sm text-destructive">{t('config.minStringNotesWarning')}</p>
      )}
      <Button onClick={onGenerate} disabled={!canGenerate} className="w-full" size="lg">
        {t('config.generate')}
      </Button>
    </div>
  )
}
