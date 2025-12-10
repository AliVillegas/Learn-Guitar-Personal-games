import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NotesContainer } from './NotesContainer'
import { createNoteDefinition } from '../../utils/notes'
import type { GameNote } from '../../types/music'

function createTestNote(id: string, solfege: string = 'do'): GameNote {
  return {
    id,
    note: createNoteDefinition(solfege as any, 3),
    status: 'pending',
  }
}

describe('NotesContainer', () => {
  it('renders all notes', () => {
    const notes = [createTestNote('1', 'do'), createTestNote('2', 're'), createTestNote('3', 'mi')]

    const { container } = render(<NotesContainer notes={notes} currentIndex={0} noteWidth={25} />)

    const noteElements = container.querySelectorAll('.quarter-note')
    expect(noteElements).toHaveLength(3)
  })

  it('marks current note as active', () => {
    const notes = [createTestNote('1', 'do'), createTestNote('2', 're'), createTestNote('3', 'mi')]

    const { container } = render(<NotesContainer notes={notes} currentIndex={1} noteWidth={25} />)

    const noteElements = container.querySelectorAll('.quarter-note')
    expect(noteElements[0]).not.toHaveClass('active')
    expect(noteElements[1]).toHaveClass('active')
    expect(noteElements[2]).not.toHaveClass('active')
  })

  it('positions notes correctly based on noteWidth', () => {
    const notes = [createTestNote('1', 'do')]

    const { container } = render(<NotesContainer notes={notes} currentIndex={0} noteWidth={30} />)

    const noteElement = container.querySelector('.quarter-note')
    expect(noteElement).toHaveStyle({ left: '15%' })
  })
})
