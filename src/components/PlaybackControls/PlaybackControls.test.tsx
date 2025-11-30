import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlaybackControls } from './PlaybackControls'
import { createNoteDefinition } from '../../utils/notes'
import type { NoteDefinition } from '../../types/music'

function createTestNotes(count: number): NoteDefinition[] {
  return Array.from({ length: count }, () => createNoteDefinition('mi', 3))
}

describe('PlaybackControls', () => {
  const mockOnPlayAll = vi.fn()
  const mockOnPlayCurrentNote = vi.fn()
  const mockOnPlayMeasure = vi.fn()
  const notes = createTestNotes(8)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('measure buttons visibility', () => {
    it('does not show measure buttons when measureCount is 1', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      expect(screen.queryByLabelText(/Play Measure/i)).not.toBeInTheDocument()
    })

    it('shows measure buttons when measureCount is 2', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      expect(screen.getByLabelText('Play Measure 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Play Measure 2')).toBeInTheDocument()
    })

    it('shows measure buttons when measureCount is 3', () => {
      const threeMeasureNotes = createTestNotes(12)
      render(
        <PlaybackControls
          notes={threeMeasureNotes}
          currentNote={threeMeasureNotes[0]}
          measureCount={3}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      expect(screen.getByLabelText('Play Measure 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Play Measure 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Play Measure 3')).toBeInTheDocument()
    })

    it('shows measure buttons when measureCount is 4', () => {
      const fourMeasureNotes = createTestNotes(16)
      render(
        <PlaybackControls
          notes={fourMeasureNotes}
          currentNote={fourMeasureNotes[0]}
          measureCount={4}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      expect(screen.getByLabelText('Play Measure 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Play Measure 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Play Measure 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Play Measure 4')).toBeInTheDocument()
    })
  })

  describe('measure button interactions', () => {
    it('calls onPlayMeasure with correct index when measure button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const measure1Button = screen.getByLabelText('Play Measure 1')
      await user.click(measure1Button)

      expect(mockOnPlayMeasure).toHaveBeenCalledWith(0)
      expect(mockOnPlayMeasure).toHaveBeenCalledTimes(1)
    })

    it('calls onPlayMeasure with correct index for second measure', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const measure2Button = screen.getByLabelText('Play Measure 2')
      await user.click(measure2Button)

      expect(mockOnPlayMeasure).toHaveBeenCalledWith(1)
      expect(mockOnPlayMeasure).toHaveBeenCalledTimes(1)
    })

    it('does not call onPlayMeasure when button is clicked while playing', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const measure1Button = screen.getByLabelText('Play Measure 1')
      await user.click(measure1Button)

      expect(mockOnPlayMeasure).not.toHaveBeenCalled()
    })

    it('disables measure buttons when isPlaying is true', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const measure1Button = screen.getByLabelText('Play Measure 1')
      const measure2Button = screen.getByLabelText('Play Measure 2')

      expect(measure1Button).toBeDisabled()
      expect(measure2Button).toBeDisabled()
    })

    it('enables measure buttons when isPlaying is false', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const measure1Button = screen.getByLabelText('Play Measure 1')
      const measure2Button = screen.getByLabelText('Play Measure 2')

      expect(measure1Button).not.toBeDisabled()
      expect(measure2Button).not.toBeDisabled()
    })
  })

  describe('play all button', () => {
    it('renders play all button', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      expect(screen.getByLabelText('Play All')).toBeInTheDocument()
    })

    it('calls onPlayAll when clicked and not playing', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const playAllButton = screen.getByLabelText('Play All')
      await user.click(playAllButton)

      expect(mockOnPlayAll).toHaveBeenCalledWith(notes)
    })

    it('does not call onPlayAll when clicked while playing', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const playAllButton = screen.getByLabelText('Play All')
      await user.click(playAllButton)

      expect(mockOnPlayAll).not.toHaveBeenCalled()
    })

    it('disables play all button when isPlaying is true', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const playAllButton = screen.getByLabelText('Play All')
      expect(playAllButton).toBeDisabled()
    })
  })

  describe('play current note button', () => {
    it('renders play current note button when currentNote is provided', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      expect(screen.getByLabelText('Play Current Note')).toBeInTheDocument()
    })

    it('calls onPlayCurrentNote when clicked and not playing', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const playCurrentNoteButton = screen.getByLabelText('Play Current Note')
      await user.click(playCurrentNoteButton)

      expect(mockOnPlayCurrentNote).toHaveBeenCalled()
    })

    it('does not call onPlayCurrentNote when clicked while playing', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const playCurrentNoteButton = screen.getByLabelText('Play Current Note')
      await user.click(playCurrentNoteButton)

      expect(mockOnPlayCurrentNote).not.toHaveBeenCalled()
    })

    it('disables play current note button when currentNote is null', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={null}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const playCurrentNoteButton = screen.getByLabelText('Play Current Note')
      expect(playCurrentNoteButton).toBeDisabled()
    })

    it('disables play current note button when isPlaying is true', () => {
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const playCurrentNoteButton = screen.getByLabelText('Play Current Note')
      expect(playCurrentNoteButton).toBeDisabled()
    })
  })

  describe('branch coverage', () => {
    it('calls onPlayAll when isPlaying is false', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const playAllButton = screen.getByLabelText('Play All')
      await user.click(playAllButton)

      expect(mockOnPlayAll).toHaveBeenCalledWith(notes)
    })

    it('does not call onPlayAll when isPlaying is true', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const playAllButton = screen.getByLabelText('Play All')
      await user.click(playAllButton)

      expect(mockOnPlayAll).not.toHaveBeenCalled()
    })

    it('calls onPlayCurrentNote when isPlaying is false and currentNote exists', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const playCurrentNoteButton = screen.getByLabelText('Play Current Note')
      await user.click(playCurrentNoteButton)

      expect(mockOnPlayCurrentNote).toHaveBeenCalled()
    })

    it('does not call onPlayCurrentNote when isPlaying is true', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const playCurrentNoteButton = screen.getByLabelText('Play Current Note')
      await user.click(playCurrentNoteButton)

      expect(mockOnPlayCurrentNote).not.toHaveBeenCalled()
    })

    it('does not call onPlayCurrentNote when currentNote is null', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={null}
          measureCount={1}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const playCurrentNoteButton = screen.getByLabelText('Play Current Note')
      await user.click(playCurrentNoteButton)

      expect(mockOnPlayCurrentNote).not.toHaveBeenCalled()
    })

    it('calls onPlayMeasure when isPlaying is false', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={false}
        />
      )

      const measure1Button = screen.getByLabelText('Play Measure 1')
      await user.click(measure1Button)

      expect(mockOnPlayMeasure).toHaveBeenCalledWith(0)
    })

    it('does not call onPlayMeasure when isPlaying is true', async () => {
      const user = userEvent.setup()
      render(
        <PlaybackControls
          notes={notes}
          currentNote={notes[0]}
          measureCount={2}
          onPlayAll={mockOnPlayAll}
          onPlayCurrentNote={mockOnPlayCurrentNote}
          onPlayMeasure={mockOnPlayMeasure}
          isPlaying={true}
        />
      )

      const measure1Button = screen.getByLabelText('Play Measure 1')
      await user.click(measure1Button)

      expect(mockOnPlayMeasure).not.toHaveBeenCalled()
    })
  })
})
