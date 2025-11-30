import { useTranslation } from 'react-i18next'
import type { NoteDefinition } from '../../types/music'

interface PlaybackControlsProps {
  notes: NoteDefinition[]
  onPlayAll: (notes: NoteDefinition[]) => void
  isPlaying: boolean
}

export function PlaybackControls({ notes, onPlayAll, isPlaying }: PlaybackControlsProps) {
  const { t } = useTranslation()

  const handlePlayAll = () => {
    if (!isPlaying) {
      onPlayAll(notes)
    }
  }

  return (
    <div className="playback-controls">
      <button
        type="button"
        onClick={handlePlayAll}
        disabled={isPlaying}
        className="play-all-button"
      >
        {t('game.playAll')}
      </button>
    </div>
  )
}

