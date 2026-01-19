import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import type { NoteDefinition, MeasureCount, MultiVoiceMeasureCount } from '../../types/music'

interface PlaybackControlsProps {
  notes: NoteDefinition[]
  currentNote: NoteDefinition | null
  measureCount: MeasureCount | MultiVoiceMeasureCount | number
  onPlayAll: (notes: NoteDefinition[]) => void
  onPlayCurrentNote: () => void
  onPlayMeasure: (measureIndex: number) => void
  isPlaying: boolean
  showPlayCurrentNote?: boolean
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
      variant="secondary"
      aria-label={t('game.playCurrentNote')}
      className="min-w-[180px]"
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
      className="min-w-[180px]"
    >
      {t('game.playAll')}
    </Button>
  )
}

function createPlayMeasureHandler(
  isPlaying: boolean,
  measureIndex: number,
  onPlayMeasure: (measureIndex: number) => void
) {
  return () => {
    if (!isPlaying) {
      onPlayMeasure(measureIndex)
    }
  }
}

function renderMeasureButtons(
  t: (key: string) => string,
  measureCount: MeasureCount | MultiVoiceMeasureCount | number,
  isPlaying: boolean,
  onPlayMeasure: (measureIndex: number) => void
) {
  if (measureCount <= 1 || measureCount === 60) {
    return null
  }

  return (
    <div className="flex justify-center gap-4 flex-wrap">
      {Array.from({ length: measureCount }, (_, i) => (
        <Button
          key={i}
          type="button"
          onClick={createPlayMeasureHandler(isPlaying, i, onPlayMeasure)}
          disabled={isPlaying}
          size="lg"
          variant="secondary"
          aria-label={t('game.playMeasure', { number: i + 1 })}
          className="min-w-[180px]"
        >
          {t('game.playMeasure', { number: i + 1 })}
        </Button>
      ))}
    </div>
  )
}

export function PlaybackControls({
  notes,
  currentNote,
  measureCount,
  onPlayAll,
  onPlayCurrentNote,
  onPlayMeasure,
  isPlaying,
  showPlayCurrentNote = true,
}: PlaybackControlsProps) {
  const { t } = useTranslation()
  const handlePlayAll = createPlayAllHandler(isPlaying, notes, onPlayAll)
  const handlePlayCurrentNote = createPlayCurrentNoteHandler(
    isPlaying,
    currentNote,
    onPlayCurrentNote
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center gap-4">
        {showPlayCurrentNote &&
          renderPlayCurrentNoteButton(t, handlePlayCurrentNote, isPlaying, currentNote)}
        {renderPlayAllButton(t, handlePlayAll, isPlaying)}
      </div>
      {renderMeasureButtons(t, measureCount, isPlaying, onPlayMeasure)}
    </div>
  )
}
