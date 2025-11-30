import { ConfigPanel } from '../NoteConfig/ConfigPanel'
import type { MeasureCount, GuitarString, SolfegeNote } from '../../types/music'
import type { StringNoteConfig } from '../../types/game'
import type { InstrumentType } from '../../types/audio'

interface ConfigSectionProps {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
  onToggleStringNote: (guitarString: GuitarString, note: SolfegeNote) => void
  onChangeMeasure: (count: MeasureCount) => void
  onChangeInstrument: (instrument: InstrumentType) => void
  onGenerate: () => void
}

export function ConfigSection({
  stringNotes,
  measureCount,
  instrument,
  onToggleStringNote,
  onChangeMeasure,
  onChangeInstrument,
  onGenerate,
}: ConfigSectionProps) {
  return (
    <ConfigPanel
      stringNotes={stringNotes}
      measureCount={measureCount}
      instrument={instrument}
      onToggleStringNote={onToggleStringNote}
      onChangeMeasure={onChangeMeasure}
      onChangeInstrument={onChangeInstrument}
      onGenerate={onGenerate}
    />
  )
}
