import { ConfigPanel } from '../NoteConfig/ConfigPanel'
import type { SolfegeNote, MeasureCount, GuitarString } from '../../types/music'

interface ConfigSectionProps {
  selectedNotes: SolfegeNote[]
  selectedStrings: GuitarString[]
  measureCount: MeasureCount
  onToggleNote: (note: SolfegeNote) => void
  onToggleString: (guitarString: GuitarString) => void
  onChangeMeasure: (count: MeasureCount) => void
  onGenerate: () => void
}

export function ConfigSection({
  selectedNotes,
  selectedStrings,
  measureCount,
  onToggleNote,
  onToggleString,
  onChangeMeasure,
  onGenerate,
}: ConfigSectionProps) {
  return (
    <ConfigPanel
      selectedNotes={selectedNotes}
      selectedStrings={selectedStrings}
      measureCount={measureCount}
      onToggleNote={onToggleNote}
      onToggleString={onToggleString}
      onChangeMeasure={onChangeMeasure}
      onGenerate={onGenerate}
    />
  )
}
