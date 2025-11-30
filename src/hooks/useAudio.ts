import { useRef, useState, useCallback } from 'react'
import type { NoteDefinition } from '../types/music'

interface UseAudioReturn {
  playNote: (note: NoteDefinition) => void
  playSequence: (notes: NoteDefinition[], bpm?: number) => Promise<void>
  playErrorSound: () => void
  isPlaying: boolean
}

const DEFAULT_BPM = 120
const QUARTER_NOTE_DURATION = 0.4

function createAudioContext(): AudioContext {
  return new AudioContext()
}

function createNoteOscillator(ctx: AudioContext, frequency: number): OscillatorNode {
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = frequency
  return osc
}

function createEnvelope(ctx: AudioContext, duration: number): GainNode {
  const gain = ctx.createGain()
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.8, now + 0.01)
  gain.gain.linearRampToValueAtTime(0.6, now + 0.1)
  gain.gain.setValueAtTime(0.6, now + duration - 0.2)
  gain.gain.linearRampToValueAtTime(0, now + duration)
  return gain
}

function ensureContextResumed(ctx: AudioContext): Promise<void> {
  if (ctx.state === 'suspended') {
    return ctx.resume()
  }
  return Promise.resolve()
}

function scheduleNote(ctx: AudioContext, note: NoteDefinition, startTime: number): void {
  const osc = createNoteOscillator(ctx, note.frequency)
  const gain = createEnvelope(ctx, QUARTER_NOTE_DURATION)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + QUARTER_NOTE_DURATION)
}

function scheduleSequence(ctx: AudioContext, notes: NoteDefinition[], bpm: number): number {
  const noteDuration = 60 / bpm
  const now = ctx.currentTime

  notes.forEach((note, index) => {
    const startTime = now + index * noteDuration
    scheduleNote(ctx, note, startTime)
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
        scheduleNote(ctx, note, ctx.currentTime)
      })
    },
    [getContext]
  )

  const playSequence = useCallback(
    async (notes: NoteDefinition[], bpm: number = DEFAULT_BPM): Promise<void> => {
      const ctx = getContext()
      await ensureContextResumed(ctx)
      setIsPlaying(true)

      const duration = scheduleSequence(ctx, notes, bpm)

      setTimeout(() => {
        setIsPlaying(false)
      }, duration)
    },
    [getContext]
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
