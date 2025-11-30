import { useRef, useState, useCallback } from 'react'
import type { NoteDefinition } from '../types/music'
import type { InstrumentType } from '../types/audio'
import { getAudioEngine } from '../utils/audioEngines'
import { useGameStore } from '../store/gameStore'

interface UseAudioReturn {
  playNote: (note: NoteDefinition) => void
  playSequence: (notes: NoteDefinition[], bpm?: number) => Promise<void>
  playErrorSound: () => void
  isPlaying: boolean
}

const DEFAULT_BPM = 120

function createAudioContext(): AudioContext {
  return new AudioContext()
}

function ensureContextResumed(ctx: AudioContext): Promise<void> {
  if (ctx.state === 'suspended') {
    return ctx.resume()
  }
  return Promise.resolve()
}

function scheduleNote(
  ctx: AudioContext,
  note: NoteDefinition,
  startTime: number,
  instrument: InstrumentType
): void {
  const engine = getAudioEngine(instrument)
  engine.playNote({ frequency: note.frequency }, startTime, ctx)
}

function scheduleSequence(
  ctx: AudioContext,
  notes: NoteDefinition[],
  bpm: number,
  instrument: InstrumentType
): number {
  const noteDuration = 60 / bpm
  const now = ctx.currentTime

  notes.forEach((note, index) => {
    const startTime = now + index * noteDuration
    scheduleNote(ctx, note, startTime, instrument)
  })

  return notes.length * noteDuration * 1000
}

function createErrorSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  osc.type = 'square'
  osc.frequency.value = 150

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.1)
}

export function useAudio(): UseAudioReturn {
  const ctxRef = useRef<AudioContext | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const instrument = useGameStore((state) => state.config.instrument)

  const getContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    return ctxRef.current
  }, [])

  const playNote = useCallback(
    (note: NoteDefinition) => {
      const ctx = getContext()
      ensureContextResumed(ctx).then(() => {
        scheduleNote(ctx, note, ctx.currentTime, instrument)
      })
    },
    [getContext, instrument]
  )

  const playSequence = useCallback(
    async (notes: NoteDefinition[], bpm: number = DEFAULT_BPM): Promise<void> => {
      const ctx = getContext()
      await ensureContextResumed(ctx)
      setIsPlaying(true)

      const duration = scheduleSequence(ctx, notes, bpm, instrument)

      setTimeout(() => {
        setIsPlaying(false)
      }, duration)
    },
    [getContext, instrument]
  )

  const playErrorSound = useCallback(() => {
    const ctx = getContext()
    ensureContextResumed(ctx).then(() => {
      createErrorSound(ctx)
    })
  }, [getContext])

  return {
    playNote,
    playSequence,
    playErrorSound,
    isPlaying,
  }
}
