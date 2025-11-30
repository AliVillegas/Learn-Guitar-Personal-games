import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { VexFlowStaff } from './VexFlowStaff'
import { createNoteDefinition } from '../../utils/notes'
import type { GameNote, MeasureCount } from '../../types/music'

function createTestNotes(count: number): GameNote[] {
  const notes: GameNote[] = []
  for (let i = 0; i < count; i++) {
    notes.push({
      id: `note-${i}`,
      note: createNoteDefinition('mi', 3),
      status: i === 0 ? 'active' : 'pending',
    })
  }
  return notes
}

describe('VexFlowStaff', () => {
  it('renders without crashing with 1 measure', () => {
    const notes = createTestNotes(4)
    const { container } = render(<VexFlowStaff notes={notes} measureCount={1} currentIndex={0} />)
    expect(container).toBeTruthy()
  })

  it('renders without crashing with 2 measures', () => {
    const notes = createTestNotes(8)
    const { container } = render(<VexFlowStaff notes={notes} measureCount={2} currentIndex={0} />)
    expect(container).toBeTruthy()
  })

  it('renders without crashing with 3 measures', () => {
    const notes = createTestNotes(12)
    const { container } = render(<VexFlowStaff notes={notes} measureCount={3} currentIndex={0} />)
    expect(container).toBeTruthy()
  })

  it('renders without crashing with 4 measures', () => {
    const notes = createTestNotes(16)
    const { container } = render(<VexFlowStaff notes={notes} measureCount={4} currentIndex={0} />)
    expect(container).toBeTruthy()
  })

  it('renders empty state when no notes provided', () => {
    const { getByText } = render(<VexFlowStaff notes={[]} measureCount={1} currentIndex={0} />)
    expect(getByText('No notes to display')).toBeTruthy()
  })

  it('handles different currentIndex values', () => {
    const notes = createTestNotes(8)
    const { container } = render(<VexFlowStaff notes={notes} measureCount={2} currentIndex={4} />)
    expect(container).toBeTruthy()
  })

  it('renders with all measure counts from 1 to 4', () => {
    const measureCounts: MeasureCount[] = [1, 2, 3, 4]
    measureCounts.forEach((measureCount) => {
      const notes = createTestNotes(measureCount * 4)
      const { container } = render(
        <VexFlowStaff notes={notes} measureCount={measureCount} currentIndex={0} />
      )
      expect(container).toBeTruthy()
    })
  })
})
