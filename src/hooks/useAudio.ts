import React, { useRef, useState, useCallback } from 'react'
import * as Tone from 'tone'
import type { NoteDefinition } from '../types/music'
import type { InstrumentType } from '../types/audio'
import {
  getAudioEngine,
  preloadGuitarSampler as initializeGuitarSynth,
  releaseAllNotes,
} from '../utils/audioEngines'
import { getGuitarSoundingFrequency } from '../utils/notes'
import { useGameStore } from '../store/gameStore'
import { useSettingsStore, type MetronomeSubdivision } from '../store/settingsStore'

interface UseAudioReturn {
  playNote: (note: NoteDefinition) => Promise<void>
  playNoteAtTime: (note: NoteDefinition, startTime: number) => Promise<void>
  getCurrentTime: () => number
  playSequence: (notes: NoteDefinition[], bpm?: number, startIndex?: number) => Promise<void>
  playErrorSound: () => void
  playSuccessSound: () => void
  isPlaying: boolean
  playingIndex: number | null
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

async function scheduleNote(
  ctx: AudioContext,
  note: NoteDefinition,
  startTime: number,
  instrument: InstrumentType
): Promise<void> {
  const engine = getAudioEngine(instrument)

  let noteName = `${note.letter}${note.octave}`
  let frequency = note.frequency

  if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
    const soundingOctave = (note.octave - 1) as 2 | 3 | 4
    noteName = `${note.letter}${soundingOctave}`
    frequency = getGuitarSoundingFrequency(note.solfege, note.octave)
    await initializeGuitarSynth()
  }

  await engine.playNote({ frequency, noteName }, startTime, ctx)
}

async function scheduleSequence(
  ctx: AudioContext,
  notes: NoteDefinition[],
  bpm: number,
  instrument: InstrumentType,
  onNoteStart: (index: number) => void,
  timeoutIds: ReturnType<typeof setTimeout>[],
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision
): Promise<number> {
  const noteDuration = 60 / bpm
  const now = ctx.currentTime
  const minDelay = 0.05

  if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
    await initializeGuitarSynth()
  }

  const promises = notes.map((note, index) => {
    const startTime = now + minDelay + index * noteDuration
    const delayMs = Math.max(0, (startTime - now) * 1000)

    const timeoutId = setTimeout(
      () => {
        onNoteStart(index)
      },
      Math.max(10, delayMs)
    )
    timeoutIds.push(timeoutId)

    if (metronomeEnabled) {
      scheduleSubdividedClicks(ctx, startTime, noteDuration, metronomeSubdivision)
    }

    return scheduleNote(ctx, note, startTime, instrument)
  })

  await Promise.all(promises)

  return notes.length * noteDuration * 1000 + minDelay * 1000
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

function createSuccessSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = 880

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.15)
}

function scheduleMetronomeClick(ctx: AudioContext, startTime: number, isAccent: boolean): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = isAccent ? 1200 : 800

  const gain = ctx.createGain()
  const volume = isAccent ? 0.1 : 0.06
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + 0.03)
}

function scheduleSubdividedClicks(
  ctx: AudioContext,
  noteStartTime: number,
  noteDuration: number,
  subdivision: MetronomeSubdivision
): void {
  const subdivisionDuration = noteDuration / subdivision
  for (let i = 0; i < subdivision; i++) {
    const clickTime = noteStartTime + i * subdivisionDuration
    const isAccent = i === 0
    scheduleMetronomeClick(ctx, clickTime, isAccent)
  }
}

function isGuitarInstrument(instrument: InstrumentType): boolean {
  return instrument === 'guitar-synth' || instrument === 'guitar-classical'
}

async function ensureToneStarted(instrument: InstrumentType): Promise<void> {
  if (isGuitarInstrument(instrument) && Tone.context.state !== 'running') {
    await Tone.start()
  }
}

function clearAllTimeouts(
  noteTimeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setPlayingIndex: (index: number | null) => void
): void {
  noteTimeoutRefs.current.forEach((id) => clearTimeout(id))
  noteTimeoutRefs.current = []

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  setPlayingIndex(null)
}

function handleSequenceEnd(
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setIsPlaying: (playing: boolean) => void,
  setPlayingIndex: (index: number | null) => void,
  duration: number
): void {
  timeoutRef.current = setTimeout(() => {
    setIsPlaying(false)
    setPlayingIndex(null)
    timeoutRef.current = null
  }, duration)
}

async function prepareSequencePlayback(
  ctx: AudioContext,
  instrument: InstrumentType,
  setIsPlaying: (playing: boolean) => void
): Promise<void> {
  await ensureContextResumed(ctx)
  await ensureToneStarted(instrument)
  setIsPlaying(true)
}

async function cleanupGuitarInstrument(instrument: InstrumentType): Promise<void> {
  if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
    await initializeGuitarSynth()
    await releaseAllNotes(instrument)
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

async function prepareNotePlayback(ctx: AudioContext, instrument: InstrumentType): Promise<void> {
  await ensureContextResumed(ctx)
  await ensureToneStarted(instrument)
}

async function playNoteImpl(
  ctx: AudioContext,
  note: NoteDefinition,
  instrument: InstrumentType
): Promise<void> {
  await prepareNotePlayback(ctx, instrument)
  await scheduleNote(ctx, note, ctx.currentTime, instrument)
}

async function playNoteAtTimeImpl(
  ctx: AudioContext,
  note: NoteDefinition,
  startTime: number,
  instrument: InstrumentType
): Promise<void> {
  await prepareNotePlayback(ctx, instrument)
  await scheduleNote(ctx, note, startTime, instrument)
}

async function playSequenceImpl(
  ctx: AudioContext,
  notes: NoteDefinition[],
  bpm: number,
  startIndex: number,
  instrument: InstrumentType,
  noteTimeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setPlayingIndex: (index: number | null) => void,
  setIsPlaying: (playing: boolean) => void,
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision
): Promise<void> {
  clearAllTimeouts(noteTimeoutRefs, timeoutRef, setPlayingIndex)
  await cleanupGuitarInstrument(instrument)
  await prepareSequencePlayback(ctx, instrument, setIsPlaying)
  const onNoteStart = (localIndex: number) => setPlayingIndex(startIndex + localIndex)
  const duration = await scheduleSequence(
    ctx,
    notes,
    bpm,
    instrument,
    onNoteStart,
    noteTimeoutRefs.current,
    metronomeEnabled,
    metronomeSubdivision
  )
  setPlayingIndex(startIndex)
  handleSequenceEnd(timeoutRef, setIsPlaying, setPlayingIndex, duration)
}

function useAudioContext() {
  const ctxRef = useRef<AudioContext | null>(null)
  return useCallback((): AudioContext => {
    if (!ctxRef.current) ctxRef.current = createAudioContext()
    return ctxRef.current
  }, [])
}

function useAudioCallbacks(getContext: () => AudioContext, instrument: InstrumentType) {
  const playNote = useCallback(
    (note: NoteDefinition) => playNoteImpl(getContext(), note, instrument),
    [getContext, instrument]
  )
  const playNoteAtTime = useCallback(
    (note: NoteDefinition, startTime: number) =>
      playNoteAtTimeImpl(getContext(), note, startTime, instrument),
    [getContext, instrument]
  )
  const getCurrentTime = useCallback(() => getContext().currentTime, [getContext])
  const playErrorSound = useCallback(
    () => ensureContextResumed(getContext()).then(() => createErrorSound(getContext())),
    [getContext]
  )
  const playSuccessSound = useCallback(
    () => ensureContextResumed(getContext()).then(() => createSuccessSound(getContext())),
    [getContext]
  )
  return { playNote, playNoteAtTime, getCurrentTime, playErrorSound, playSuccessSound }
}

export function useAudio(): UseAudioReturn {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noteTimeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const instrument = useGameStore((state) => state.config.instrument)
  const metronomeEnabled = useSettingsStore((state) => state.metronomeEnabled)
  const metronomeSubdivision = useSettingsStore((state) => state.metronomeSubdivision)
  const getContext = useAudioContext()
  const { playNote, playNoteAtTime, getCurrentTime, playErrorSound, playSuccessSound } =
    useAudioCallbacks(getContext, instrument)

  const playSequence = useCallback(
    (notes: NoteDefinition[], bpm = DEFAULT_BPM, startIndex = 0) =>
      playSequenceImpl(
        getContext(),
        notes,
        bpm,
        startIndex,
        instrument,
        noteTimeoutRefs,
        timeoutRef,
        setPlayingIndex,
        setIsPlaying,
        metronomeEnabled,
        metronomeSubdivision
      ),
    [getContext, instrument, metronomeEnabled, metronomeSubdivision]
  )

  return {
    playNote,
    playNoteAtTime,
    getCurrentTime,
    playSequence,
    playErrorSound,
    playSuccessSound,
    isPlaying,
    playingIndex,
  }
}
