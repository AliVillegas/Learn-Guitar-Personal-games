import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QuarterNote } from './QuarterNote'
import { createNoteDefinition } from '../../utils/notes'
import type { GameNote } from '../../types/music'

function createTestNote(solfege: string, status: GameNote['status'] = 'pending'): GameNote {
  return {
    id: '1',
    note: createNoteDefinition(solfege as any, 3),
    status,
  }
}

describe('QuarterNote', () => {
  it('renders note with correct position', () => {
    const note = createTestNote('do')
    const { container } = render(
      <QuarterNote note={note} isActive={false} horizontalPosition={50} />
    )

    const noteElement = container.querySelector('.quarter-note')
    expect(noteElement).toHaveStyle({ left: '50%' })
  })

  it('applies active class when isActive is true', () => {
    const note = createTestNote('do')
    const { container } = render(
      <QuarterNote note={note} isActive={true} horizontalPosition={50} />
    )

    const noteElement = container.querySelector('.quarter-note')
    expect(noteElement).toHaveClass('active')
  })

  it('applies status class', () => {
    const note = createTestNote('do', 'correct')
    const { container } = render(
      <QuarterNote note={note} isActive={false} horizontalPosition={50} />
    )

    const noteElement = container.querySelector('.quarter-note')
    expect(noteElement).toHaveClass('correct')
  })

  it('renders ledger line when needed', () => {
    const note = createTestNote('do')
    note.note.staffPosition = -5

    const { container } = render(
      <QuarterNote note={note} isActive={false} horizontalPosition={50} />
    )

    const ledgerLine = container.querySelector('.ledger-line')
    expect(ledgerLine).toBeInTheDocument()
  })

  it('does not render ledger line when not needed', () => {
    const note = createTestNote('do')
    note.note.staffPosition = 0

    const { container } = render(
      <QuarterNote note={note} isActive={false} horizontalPosition={50} />
    )

    const ledgerLine = container.querySelector('.ledger-line')
    expect(ledgerLine).not.toBeInTheDocument()
  })

  it('renders note head and stem', () => {
    const note = createTestNote('do')
    const { container } = render(
      <QuarterNote note={note} isActive={false} horizontalPosition={50} />
    )

    expect(container.querySelector('.note-head')).toBeInTheDocument()
    expect(container.querySelector('.note-stem')).toBeInTheDocument()
  })
})
