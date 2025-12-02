import { ConfigPanel } from '../NoteConfig/ConfigPanel'
import type { MeasureCount, GuitarString, SolfegeNote } from '../../types/music'
import type { StringNoteConfig } from '../../types/game'
import type { InstrumentType } from '../../types/audio'

interface ConfigSectionProps {
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

export function ConfigSection({
  stringNotes,
  measureCount,
  instrument,
  autoPlayOnGenerate,
  onToggleStringNote,
  onChangeMeasure,
  onChangeInstrument,
  onChangeAutoPlay,
  onGenerate,
}: ConfigSectionProps) {
  return (
    <ConfigPanel
      stringNotes={stringNotes}
      measureCount={measureCount}
      instrument={instrument}
      autoPlayOnGenerate={autoPlayOnGenerate}
      onToggleStringNote={onToggleStringNote}
      onChangeMeasure={onChangeMeasure}
      onChangeInstrument={onChangeInstrument}
      onChangeAutoPlay={onChangeAutoPlay}
      onGenerate={onGenerate}
    />
  )
}
