import type { GameNote, MeasureCount } from '../../types/music'
import { VexFlowStaff } from './VexFlowStaff'

interface StaffProps {
  notes: GameNote[]
  measureCount: MeasureCount
  currentIndex: number
}

export function Staff({ notes, measureCount, currentIndex }: StaffProps) {
  return <VexFlowStaff notes={notes} measureCount={measureCount} currentIndex={currentIndex} />
}
