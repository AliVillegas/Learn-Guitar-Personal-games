import { ConfigPanel } from '../NoteConfig/ConfigPanel'
import type { MeasureCount, GuitarString, SolfegeNote } from '../../types/music'
import type { StringNoteConfig } from '../../types/game'

interface ConfigSectionProps {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  onToggleStringNote: (guitarString: GuitarString, note: SolfegeNote) => void
  onChangeMeasure: (count: MeasureCount) => void
  onGenerate: () => void
}

export function ConfigSection({
  stringNotes,
  measureCount,
  onToggleStringNote,
  onChangeMeasure,
  onGenerate,
}: ConfigSectionProps) {
  return (
    <ConfigPanel
      stringNotes={stringNotes}
      measureCount={measureCount}
      onToggleStringNote={onToggleStringNote}
      onChangeMeasure={onChangeMeasure}
      onGenerate={onGenerate}
    />
  )
}
