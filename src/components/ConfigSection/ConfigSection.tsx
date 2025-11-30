import { ConfigPanel } from '../NoteConfig/ConfigPanel'
import type { SolfegeNote, MeasureCount } from '../../types/music'

interface ConfigSectionProps {
  selectedNotes: SolfegeNote[]
  measureCount: MeasureCount
  onToggleNote: (note: SolfegeNote) => void
  onChangeMeasure: (count: MeasureCount) => void
  onGenerate: () => void
}

export function ConfigSection({
  selectedNotes,
  measureCount,
  onToggleNote,
  onChangeMeasure,
  onGenerate,
}: ConfigSectionProps) {
  return (
    <ConfigPanel
      selectedNotes={selectedNotes}
      measureCount={measureCount}
      onToggleNote={onToggleNote}
      onChangeMeasure={onChangeMeasure}
      onGenerate={onGenerate}
    />
  )
}

