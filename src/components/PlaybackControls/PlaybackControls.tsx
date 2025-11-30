import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
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
    <div className="flex justify-center">
      <Button
        type="button"
        onClick={handlePlayAll}
        disabled={isPlaying}
        size="lg"
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {t('game.playAll')}
      </Button>
    </div>
  )
}
