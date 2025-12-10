import * as Tone from 'tone'
import type { AudioEngine, InstrumentType } from '../types/audio'

const QUARTER_NOTE_DURATION = 0.4

let guitarSynth: Tone.PolySynth<Tone.Synth> | null = null
let synthReadyPromise: Promise<void> | null = null

let guitarClassicalSampler: Tone.Sampler | null = null
let samplerReadyPromise: Promise<void> | null = null

const GUITAR_CLASSICAL_SAMPLES_BASE_URL = '/samples/guitar-nylon/'

async function initializeGuitarSynth(): Promise<void> {
  if (guitarSynth) {
    return
  }

  if (synthReadyPromise) {
    return synthReadyPromise
  }

  synthReadyPromise = (async () => {
    try {
      await ensureToneContextRunning()
      guitarSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sawtooth',
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5,
        },
      }).toDestination()
    } catch (error) {
      console.error('Failed to initialize guitar synth:', error)
      throw error
    }
  })()

  return synthReadyPromise
}

function createMidiOscillator(ctx: AudioContext, frequency: number): OscillatorNode {
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = frequency
  return osc
}

function createMidiEnvelope(ctx: AudioContext, duration: number): GainNode {
  const gain = ctx.createGain()
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.8, now + 0.01)
  gain.gain.linearRampToValueAtTime(0.6, now + 0.1)
  gain.gain.setValueAtTime(0.6, now + duration - 0.2)
  gain.gain.linearRampToValueAtTime(0, now + duration)
  return gain
}

const midiEngine: AudioEngine = {
  playNote: (note, startTime, ctx, duration = QUARTER_NOTE_DURATION) => {
    const osc = createMidiOscillator(ctx, note.frequency)
    const gain = createMidiEnvelope(ctx, duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + duration)
  },
  createEnvelope: createMidiEnvelope,
}

function createGuitarEnvelope(ctx: AudioContext, duration: number): GainNode {
  const gain = ctx.createGain()
  const now = ctx.currentTime
  const attackTime = 0.005
  const decayTime = 0.1
  const sustainLevel = 0.4
  const releaseTime = duration - attackTime - decayTime

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.9, now + attackTime)
  gain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime)
  gain.gain.setValueAtTime(sustainLevel, now + duration - releaseTime)
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

  return gain
}

function createClassicalGuitarUrls(): Record<string, string> {
  return {
    'C#3': 'Cs3.mp3',
    D3: 'D3.mp3',
    'D#4': 'Ds4.mp3',
    E3: 'E3.mp3',
    E4: 'E4.mp3',
    E5: 'E5.mp3',
    'F#3': 'Fs3.mp3',
    'F#4': 'Fs4.mp3',
    'F#5': 'Fs5.mp3',
    G3: 'G3.mp3',
    'G#4': 'Gs4.mp3',
    G5: 'G5.mp3',
    A3: 'A3.mp3',
    A4: 'A4.mp3',
    B3: 'B3.mp3',
    B4: 'B4.mp3',
    'C#4': 'Cs4.mp3',
    'C#5': 'Cs5.mp3',
    D5: 'D5.mp3',
  }
}

async function initializeGuitarClassicalSampler(): Promise<void> {
  if (guitarClassicalSampler) {
    return
  }

  if (samplerReadyPromise) {
    return samplerReadyPromise
  }

  samplerReadyPromise = (async () => {
    try {
      await ensureToneContextRunning()
      const urls = createClassicalGuitarUrls()
      guitarClassicalSampler = new Tone.Sampler({
        urls,
        release: 1,
        baseUrl: GUITAR_CLASSICAL_SAMPLES_BASE_URL,
        attack: 0.1,
      })
      guitarClassicalSampler.volume.value = -6
      guitarClassicalSampler.toDestination()
      await Tone.loaded()
    } catch (error) {
      console.error('Failed to initialize classical guitar sampler:', error)
      throw error
    }
  })()

  return samplerReadyPromise
}

async function ensureToneContextRunning(): Promise<void> {
  if (Tone.context.state !== 'running') {
    await Tone.start()
  }
}

async function releaseAllGuitarSynthNotes(): Promise<void> {
  await initializeGuitarSynth()
  if (guitarSynth) {
    guitarSynth.releaseAll()
  }
}

async function playGuitarSynthNote(
  note: { noteName?: string; frequency: number },
  startTime: number,
  ctx: AudioContext,
  duration: number = QUARTER_NOTE_DURATION
): Promise<void> {
  if (!note.noteName) {
    console.warn('No note name provided:', note)
    return
  }

  await initializeGuitarSynth()

  if (!guitarSynth) {
    console.warn('Guitar synth not ready after initialization')
    return
  }

  await ensureToneContextRunning()

  const delay = Math.max(0, startTime - ctx.currentTime)

  if (delay > 0) {
    const toneTime = Tone.now() + delay
    guitarSynth.triggerAttackRelease(note.noteName, duration, toneTime)
  } else {
    guitarSynth.triggerAttackRelease(note.noteName, duration)
  }
}

async function releaseAllGuitarClassicalNotes(): Promise<void> {
  await initializeGuitarClassicalSampler()
  if (guitarClassicalSampler) {
    guitarClassicalSampler.releaseAll()
  }
}

function findClosestNote(noteName: string): string {
  const noteMap: Record<string, string[]> = {
    F3: ['F#3', 'Fs3', 'E3'],
    F4: ['F#4', 'Fs4', 'E4'],
    C3: ['C#3', 'Cs3', 'B3'],
    C4: ['C#4', 'Cs4', 'B3'],
    D4: ['D#4', 'Ds4', 'C#4', 'Cs4'],
    G4: ['G#4', 'Gs4', 'F#4', 'Fs4'],
    A4: ['G#4', 'Gs4', 'B3'],
    B4: ['C#4', 'Cs4', 'A3'],
  }

  if (noteMap[noteName]) {
    return noteMap[noteName][0]
  }

  return noteName
}

function triggerNoteWithDelay(
  sampler: Tone.Sampler,
  noteName: string,
  delay: number,
  duration: number = QUARTER_NOTE_DURATION
): void {
  if (delay > 0) {
    const toneTime = Tone.now() + delay
    sampler.triggerAttackRelease(noteName, duration, toneTime)
  } else {
    sampler.triggerAttackRelease(noteName, duration)
  }
}

function playFallbackNote(
  sampler: Tone.Sampler,
  originalNote: string,
  delay: number,
  duration: number = QUARTER_NOTE_DURATION
): void {
  const fallbackNote = findClosestNote(originalNote)
  console.warn(`Note ${originalNote} not available, using fallback ${fallbackNote}`)
  triggerNoteWithDelay(sampler, fallbackNote, delay, duration)
}

function validateNoteAndSampler(note: { noteName?: string; frequency: number }): boolean {
  if (!note.noteName) {
    console.warn('No note name provided:', note)
    return false
  }
  if (!guitarClassicalSampler) {
    console.warn('Classical guitar sampler not ready after initialization')
    return false
  }
  return true
}

function playNoteWithFallback(
  sampler: Tone.Sampler,
  noteToPlay: string,
  delay: number,
  duration: number
) {
  try {
    triggerNoteWithDelay(sampler, noteToPlay, delay, duration)
  } catch (error) {
    const fallbackNote = findClosestNote(noteToPlay)
    if (fallbackNote !== noteToPlay) {
      playFallbackNote(sampler, noteToPlay, delay, duration)
    } else {
      throw error
    }
  }
}

async function playGuitarClassicalNote(
  note: { noteName?: string; frequency: number },
  startTime: number,
  ctx: AudioContext,
  duration: number = QUARTER_NOTE_DURATION
): Promise<void> {
  if (!validateNoteAndSampler(note)) {
    return
  }

  await initializeGuitarClassicalSampler()

  if (!guitarClassicalSampler) {
    return
  }

  await ensureToneContextRunning()

  const delay = Math.max(0, startTime - ctx.currentTime)
  const noteToPlay = note.noteName
  if (!noteToPlay) {
    return
  }

  playNoteWithFallback(guitarClassicalSampler, noteToPlay, delay, duration)
}

const guitarSynthEngine: AudioEngine = {
  playNote: async (note, startTime, ctx, duration) => {
    try {
      await playGuitarSynthNote(note, startTime, ctx, duration)
    } catch (error) {
      console.error('Error playing guitar synth note:', error, {
        noteName: note.noteName,
        frequency: note.frequency,
      })
    }
  },
  createEnvelope: createGuitarEnvelope,
}

const guitarClassicalEngine: AudioEngine = {
  playNote: async (note, startTime, ctx, duration) => {
    try {
      await playGuitarClassicalNote(note, startTime, ctx, duration)
    } catch (error) {
      console.error('Error playing classical guitar note:', error, {
        noteName: note.noteName,
        frequency: note.frequency,
      })
    }
  },
  createEnvelope: createGuitarEnvelope,
}

export function preloadGuitarSampler(): Promise<void> {
  return Promise.all([initializeGuitarSynth(), initializeGuitarClassicalSampler()]).then(() => {})
}

export async function releaseAllNotes(instrument: InstrumentType): Promise<void> {
  if (instrument === 'guitar-synth') {
    await releaseAllGuitarSynthNotes()
  } else if (instrument === 'guitar-classical') {
    await releaseAllGuitarClassicalNotes()
  }
}

export function getAudioEngine(instrument: InstrumentType): AudioEngine {
  switch (instrument) {
    case 'guitar-synth':
      initializeGuitarSynth()
      return guitarSynthEngine
    case 'guitar-classical':
      initializeGuitarClassicalSampler()
      return guitarClassicalEngine
    case 'midi':
    default:
      return midiEngine
  }
}
