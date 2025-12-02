import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useSettingsStore } from '../../store/settingsStore'

const MIN_BPM = 20
const MAX_BPM = 200

const bpmSchema = z.number().int().min(MIN_BPM).max(MAX_BPM)

function validateAndParseBpm(value: string): number | null {
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) return null
  const result = bpmSchema.safeParse(parsed)
  return result.success ? result.data : null
}

function clampBpm(value: number): number {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, value))
}

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

function getBpmInputClassName(hasError: boolean): string {
  const baseClasses =
    'w-14 h-8 text-sm font-mono font-semibold text-center rounded border transition-colors'
  const errorClasses = 'border-destructive bg-destructive/10 text-destructive'
  const normalClasses =
    'border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary'
  return `${baseClasses} ${hasError ? errorClasses : normalClasses}`
}

function BpmInput({
  inputValue,
  onInputChange,
  onBlur,
  hasError,
}: {
  inputValue: string
  onInputChange: (value: string) => void
  onBlur: () => void
  hasError: boolean
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={inputValue}
      onChange={(e) => onInputChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => e.key === 'Enter' && onBlur()}
      className={getBpmInputClassName(hasError)}
      aria-label={`BPM value, valid range ${MIN_BPM} to ${MAX_BPM}`}
    />
  )
}

function processInputChange(
  newValue: string,
  setInputValue: (v: string) => void,
  setHasError: (v: boolean) => void,
  onChange: (v: number) => void
) {
  setInputValue(newValue)
  const validated = validateAndParseBpm(newValue)
  if (validated !== null) {
    setHasError(false)
    onChange(validated)
  } else {
    setHasError(newValue !== '' && newValue !== '-')
  }
}

function processBlur(
  inputValue: string,
  value: number,
  setInputValue: (v: string) => void,
  setHasError: (v: boolean) => void,
  onChange: (v: number) => void
) {
  const validated = validateAndParseBpm(inputValue)
  if (validated !== null) {
    setInputValue(validated.toString())
    setHasError(false)
    return
  }
  const parsed = parseInt(inputValue, 10)
  if (!isNaN(parsed)) {
    const clamped = clampBpm(parsed)
    onChange(clamped)
    setInputValue(clamped.toString())
  } else {
    setInputValue(value.toString())
  }
  setHasError(false)
}

function useBpmInputState(value: number, onChange: (value: number) => void) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [hasError, setHasError] = useState(false)

  const handleInputChange = (newValue: string) =>
    processInputChange(newValue, setInputValue, setHasError, onChange)
  const handleBlur = () => processBlur(inputValue, value, setInputValue, setHasError, onChange)
  const handleSliderChange = (newValue: number) => {
    onChange(newValue)
    setInputValue(newValue.toString())
    setHasError(false)
  }

  return { inputValue, hasError, handleInputChange, handleBlur, handleSliderChange }
}

interface BpmSliderProps {
  value: number
  onChange: (value: number) => void
  label: string
}

function RangeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      min={MIN_BPM}
      max={MAX_BPM}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-28 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
    />
  )
}

function BpmSlider({ value, onChange, label }: BpmSliderProps) {
  const state = useBpmInputState(value, onChange)
  return (
    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md border border-border/50">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</label>
      <RangeSlider value={value} onChange={state.handleSliderChange} />
      <BpmInput
        inputValue={state.inputValue}
        onInputChange={state.handleInputChange}
        onBlur={state.handleBlur}
        hasError={state.hasError}
      />
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
