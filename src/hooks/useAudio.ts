import React, { useRef, useState, useCallback } from 'react'
import * as Tone from 'tone'
import type { NoteDefinition } from '../types/music'
import type { InstrumentType } from '../types/audio'
import type { TimedNote } from '../utils/sequenceHelpers'
import {
  getAudioEngine,
  preloadGuitarSampler as initializeGuitarSynth,
  releaseAllNotes,
} from '../utils/audioEngines'
import { getGuitarSoundingFrequency } from '../utils/notes'
import { useSettingsStore, type MetronomeSubdivision } from '../store/settingsStore'

interface UseAudioReturn {
  playNote: (note: NoteDefinition) => Promise<void>
  playNoteAtTime: (note: NoteDefinition, startTime: number) => Promise<void>
  getCurrentTime: () => number
  playSequence: (notes: NoteDefinition[], bpm?: number, startIndex?: number) => Promise<void>
  playChordSequence: (
    chordGroups: NoteDefinition[][],
    bpm?: number,
    startIndex?: number
  ) => Promise<void>
  playTimedSequence: (
    timedGroups: TimedNote[][],
    bpm?: number,
    startIndex?: number,
    beatsPerMeasure?: number
  ) => Promise<void>
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
  instrument: InstrumentType,
  duration?: number
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

  await engine.playNote({ frequency, noteName }, startTime, ctx, duration)
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

async function scheduleChordSequence(
  ctx: AudioContext,
  chordGroups: NoteDefinition[][],
  bpm: number,
  instrument: InstrumentType,
  onChordStart: (index: number) => void,
  timeoutIds: ReturnType<typeof setTimeout>[],
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision
): Promise<number> {
  const chordDuration = 60 / bpm
  const now = ctx.currentTime
  const minDelay = 0.05

  if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
    await initializeGuitarSynth()
  }

  const allPromises: Promise<void>[] = []

  chordGroups.forEach((chord, chordIndex) => {
    const startTime = now + minDelay + chordIndex * chordDuration
    const delayMs = Math.max(0, (startTime - now) * 1000)

    const timeoutId = setTimeout(
      () => {
        onChordStart(chordIndex)
      },
      Math.max(10, delayMs)
    )
    timeoutIds.push(timeoutId)

    if (metronomeEnabled) {
      scheduleSubdividedClicks(ctx, startTime, chordDuration, metronomeSubdivision)
    }

    chord.forEach((note) => {
      allPromises.push(scheduleNote(ctx, note, startTime, instrument))
    })
  })

  await Promise.all(allPromises)

  return chordGroups.length * chordDuration * 1000 + minDelay * 1000
}

async function scheduleTimedSequence(
  ctx: AudioContext,
  timedGroups: TimedNote[][],
  bpm: number,
  instrument: InstrumentType,
  onMeasureStart: (index: number) => void,
  timeoutIds: ReturnType<typeof setTimeout>[],
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision,
  beatsPerMeasure: number = 4
): Promise<number> {
  const beatDuration = 60 / bpm
  const measureDuration = beatDuration * beatsPerMeasure
  const now = ctx.currentTime
  const minDelay = 0.05

  if (instrument === 'guitar-synth' || instrument === 'guitar-classical') {
    await initializeGuitarSynth()
  }

  const allPromises: Promise<void>[] = []

  timedGroups.forEach((timedNotes, measureIndex) => {
    const measureStartTime = now + minDelay + measureIndex * measureDuration
    const delayMs = Math.max(0, (measureStartTime - now) * 1000)

    const timeoutId = setTimeout(
      () => {
        onMeasureStart(measureIndex)
      },
      Math.max(10, delayMs)
    )
    timeoutIds.push(timeoutId)

    if (metronomeEnabled) {
      scheduleMeasureMetronome(
        ctx,
        measureStartTime,
        beatDuration,
        beatsPerMeasure,
        metronomeSubdivision,
        instrument
      )
    }

    timedNotes.forEach((timedNote) => {
      const noteStartTime = measureStartTime + timedNote.beatOffset * beatDuration
      const noteDuration = timedNote.durationInBeats * beatDuration
      allPromises.push(scheduleNote(ctx, timedNote.note, noteStartTime, instrument, noteDuration))
    })
  })

  await Promise.all(allPromises)

  return timedGroups.length * measureDuration * 1000 + minDelay * 1000
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

const GUITAR_ATTACK_COMPENSATION = 0.08

function scheduleSubdividedClicks(
  ctx: AudioContext,
  noteStartTime: number,
  noteDuration: number,
  subdivision: MetronomeSubdivision
): void {
  const subdivisionDuration = noteDuration / subdivision
  for (let i = 0; i < subdivision; i++) {
    const clickTime = noteStartTime + i * subdivisionDuration + GUITAR_ATTACK_COMPENSATION
    const isAccent = i === 0
    scheduleMetronomeClick(ctx, clickTime, isAccent)
  }
}

function scheduleMeasureMetronome(
  ctx: AudioContext,
  measureStartTime: number,
  beatDuration: number,
  beatsPerMeasure: number,
  metronomeSubdivision: MetronomeSubdivision,
  instrument: InstrumentType
): void {
  const useCompensation = isGuitarInstrument(instrument)
  if (metronomeSubdivision === 1) {
    for (let beat = 0; beat < beatsPerMeasure; beat++) {
      const beatTime = measureStartTime + beat * beatDuration
      const compensatedTime = useCompensation ? beatTime + GUITAR_ATTACK_COMPENSATION : beatTime
      const isAccent = beat === 0
      scheduleMetronomeClick(ctx, compensatedTime, isAccent)
    }
  } else {
    for (let beat = 0; beat < beatsPerMeasure; beat++) {
      const beatStartTime = measureStartTime + beat * beatDuration
      scheduleSubdividedClicks(ctx, beatStartTime, beatDuration, metronomeSubdivision)
    }
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

async function playChordSequenceImpl(
  ctx: AudioContext,
  chordGroups: NoteDefinition[][],
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
  const onChordStart = (localIndex: number) => setPlayingIndex(startIndex + localIndex)
  const duration = await scheduleChordSequence(
    ctx,
    chordGroups,
    bpm,
    instrument,
    onChordStart,
    noteTimeoutRefs.current,
    metronomeEnabled,
    metronomeSubdivision
  )
  setPlayingIndex(startIndex)
  handleSequenceEnd(timeoutRef, setIsPlaying, setPlayingIndex, duration)
}

async function playTimedSequenceImpl(
  ctx: AudioContext,
  timedGroups: TimedNote[][],
  bpm: number,
  startIndex: number,
  instrument: InstrumentType,
  noteTimeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setPlayingIndex: (index: number | null) => void,
  setIsPlaying: (playing: boolean) => void,
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision,
  beatsPerMeasure: number = 4
): Promise<void> {
  clearAllTimeouts(noteTimeoutRefs, timeoutRef, setPlayingIndex)
  await cleanupGuitarInstrument(instrument)
  await prepareSequencePlayback(ctx, instrument, setIsPlaying)
  const onMeasureStart = (localIndex: number) => setPlayingIndex(startIndex + localIndex)
  const duration = await scheduleTimedSequence(
    ctx,
    timedGroups,
    bpm,
    instrument,
    onMeasureStart,
    noteTimeoutRefs.current,
    metronomeEnabled,
    metronomeSubdivision,
    beatsPerMeasure
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

function useAudioState() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noteTimeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  return { timeoutRef, noteTimeoutRefs, isPlaying, setIsPlaying, playingIndex, setPlayingIndex }
}

function useAudioCallbacksAndSettings(instrument: InstrumentType) {
  const getContext = useAudioContext()
  const { playNote, playNoteAtTime, getCurrentTime, playErrorSound, playSuccessSound } =
    useAudioCallbacks(getContext, instrument)
  return { getContext, playNote, playNoteAtTime, getCurrentTime, playErrorSound, playSuccessSound }
}

function usePlaySequenceCallback(
  getContext: () => AudioContext,
  instrument: InstrumentType,
  noteTimeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setPlayingIndex: (index: number | null) => void,
  setIsPlaying: (playing: boolean) => void,
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision
) {
  return useCallback(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getContext, instrument, metronomeEnabled, metronomeSubdivision]
  )
}

function usePlayChordSequenceCallback(
  getContext: () => AudioContext,
  instrument: InstrumentType,
  noteTimeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setPlayingIndex: (index: number | null) => void,
  setIsPlaying: (playing: boolean) => void,
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision
) {
  return useCallback(
    (chordGroups: NoteDefinition[][], bpm = DEFAULT_BPM, startIndex = 0) =>
      playChordSequenceImpl(
        getContext(),
        chordGroups,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getContext, instrument, metronomeEnabled, metronomeSubdivision]
  )
}

function usePlayTimedSequenceCallback(
  getContext: () => AudioContext,
  instrument: InstrumentType,
  noteTimeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setPlayingIndex: (index: number | null) => void,
  setIsPlaying: (playing: boolean) => void,
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision
) {
  return useCallback(
    (timedGroups: TimedNote[][], bpm = DEFAULT_BPM, startIndex = 0, beatsPerMeasure = 4) =>
      playTimedSequenceImpl(
        getContext(),
        timedGroups,
        bpm,
        startIndex,
        instrument,
        noteTimeoutRefs,
        timeoutRef,
        setPlayingIndex,
        setIsPlaying,
        metronomeEnabled,
        metronomeSubdivision,
        beatsPerMeasure
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getContext, instrument, metronomeEnabled, metronomeSubdivision]
  )
}

function useAudioSequenceCallbacks(
  getContext: () => AudioContext,
  instrument: InstrumentType,
  noteTimeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setPlayingIndex: (index: number | null) => void,
  setIsPlaying: (playing: boolean) => void,
  metronomeEnabled: boolean,
  metronomeSubdivision: MetronomeSubdivision
) {
  const playSequence = usePlaySequenceCallback(
    getContext,
    instrument,
    noteTimeoutRefs,
    timeoutRef,
    setPlayingIndex,
    setIsPlaying,
    metronomeEnabled,
    metronomeSubdivision
  )

  const playChordSequence = usePlayChordSequenceCallback(
    getContext,
    instrument,
    noteTimeoutRefs,
    timeoutRef,
    setPlayingIndex,
    setIsPlaying,
    metronomeEnabled,
    metronomeSubdivision
  )

  const playTimedSequence = usePlayTimedSequenceCallback(
    getContext,
    instrument,
    noteTimeoutRefs,
    timeoutRef,
    setPlayingIndex,
    setIsPlaying,
    metronomeEnabled,
    metronomeSubdivision
  )

  return { playSequence, playChordSequence, playTimedSequence }
}

export function useAudio(): UseAudioReturn {
  const { timeoutRef, noteTimeoutRefs, isPlaying, setIsPlaying, playingIndex, setPlayingIndex } =
    useAudioState()
  const instrument = useSettingsStore((state) => state.instrument)
  const metronomeEnabled = useSettingsStore((state) => state.metronomeEnabled)
  const metronomeSubdivision = useSettingsStore((state) => state.metronomeSubdivision)
  const { getContext, playNote, playNoteAtTime, getCurrentTime, playErrorSound, playSuccessSound } =
    useAudioCallbacksAndSettings(instrument)

  const { playSequence, playChordSequence, playTimedSequence } = useAudioSequenceCallbacks(
    getContext,
    instrument,
    noteTimeoutRefs,
    timeoutRef,
    setPlayingIndex,
    setIsPlaying,
    metronomeEnabled,
    metronomeSubdivision
  )

  return {
    playNote,
    playNoteAtTime,
    getCurrentTime,
    playSequence,
    playChordSequence,
    playTimedSequence,
    playErrorSound,
    playSuccessSound,
    isPlaying,
    playingIndex,
  }
}
