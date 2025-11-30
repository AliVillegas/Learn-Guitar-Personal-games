import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import type { NoteDefinition } from '../../types/music'

interface PlaybackControlsProps {
  notes: NoteDefinition[]
  currentNote: NoteDefinition | null
  onPlayAll: (notes: NoteDefinition[]) => void
  onPlayCurrentNote: () => void
  isPlaying: boolean
}

function createPlayAllHandler(
  isPlaying: boolean,
  notes: NoteDefinition[],
  onPlayAll: (notes: NoteDefinition[]) => void
) {
  return () => {
    if (!isPlaying) {
      onPlayAll(notes)
    }
  }
}

function createPlayCurrentNoteHandler(
  isPlaying: boolean,
  currentNote: NoteDefinition | null,
  onPlayCurrentNote: () => void
) {
  return () => {
    if (!isPlaying && currentNote) {
      onPlayCurrentNote()
    }
  }
}

function renderPlayCurrentNoteButton(
  t: (key: string) => string,
  handlePlayCurrentNote: () => void,
  isPlaying: boolean,
  currentNote: NoteDefinition | null
) {
  return (
    <Button
      type="button"
      onClick={handlePlayCurrentNote}
      disabled={isPlaying || !currentNote}
      size="lg"
      variant="outline"
      aria-label={t('game.playCurrentNote')}
    >
      {t('game.playCurrentNote')}
    </Button>
  )
}

function renderPlayAllButton(
  t: (key: string) => string,
  handlePlayAll: () => void,
  isPlaying: boolean
) {
  return (
    <Button
      type="button"
      onClick={handlePlayAll}
      disabled={isPlaying}
      size="lg"
      variant="default"
      aria-label={t('game.playAll')}
    >
      {t('game.playAll')}
    </Button>
  )
}

export function PlaybackControls({
  notes,
  currentNote,
  onPlayAll,
  onPlayCurrentNote,
  isPlaying,
}: PlaybackControlsProps) {
  const { t } = useTranslation()
  const handlePlayAll = createPlayAllHandler(isPlaying, notes, onPlayAll)
  const handlePlayCurrentNote = createPlayCurrentNoteHandler(
    isPlaying,
    currentNote,
    onPlayCurrentNote
  )

  return (
    <div className="flex justify-center gap-4">
      {renderPlayCurrentNoteButton(t, handlePlayCurrentNote, isPlaying, currentNote)}
      {renderPlayAllButton(t, handlePlayAll, isPlaying)}
    </div>
  )
}
