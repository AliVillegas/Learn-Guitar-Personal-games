import type {
  GameNote,
  MeasureCount,
  MultiVoiceGameNote,
  MultiVoiceMeasureCount,
} from '../../types/music'
import { VexFlowStaff } from './VexFlowStaff'

interface StaffProps {
  notes: GameNote[] | MultiVoiceGameNote[]
  measureCount: MeasureCount | MultiVoiceMeasureCount | number
  currentIndex: number
}

export function Staff({ notes, measureCount, currentIndex }: StaffProps) {
  return <VexFlowStaff notes={notes} measureCount={measureCount} currentIndex={currentIndex} />
}
