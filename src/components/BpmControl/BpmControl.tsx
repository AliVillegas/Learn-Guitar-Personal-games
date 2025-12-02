import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'

const MIN_BPM = 20
const MAX_BPM = 200

function CogIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function BpmSlider({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (value: number) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md border border-border/50">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</label>
      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-32 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <span className="text-sm font-mono font-semibold text-foreground min-w-[4ch] text-right">
        {value}
      </span>
    </div>
  )
}

export function BpmControl() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const playbackBpm = useSettingsStore((state) => state.playbackBpm)
  const setPlaybackBpm = useSettingsStore((state) => state.setPlaybackBpm)

  return (
    <div className="flex items-center justify-end gap-3">
      {isOpen && (
        <BpmSlider value={playbackBpm} onChange={setPlaybackBpm} label={t('game.bpmLabel')} />
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all duration-200 hover:bg-muted ${
          isOpen ? 'bg-primary text-primary-foreground rotate-90' : 'text-muted-foreground'
        }`}
        aria-label={t('game.speedSettings')}
      >
        <CogIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
