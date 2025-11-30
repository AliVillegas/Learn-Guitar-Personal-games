import * as Tone from 'tone'
import type { AudioEngine, InstrumentType } from '../types/audio'

const QUARTER_NOTE_DURATION = 0.4

let guitarSampler: Tone.Sampler | null = null
let samplerReadyPromise: Promise<void> | null = null

const GUITAR_SAMPLER_URLS = {
  C3: 'https://tonejs.github.io/audio/salamander/C3.mp3',
  'C#3': 'https://tonejs.github.io/audio/salamander/Cs3.mp3',
  D3: 'https://tonejs.github.io/audio/salamander/D3.mp3',
  'D#3': 'https://tonejs.github.io/audio/salamander/Ds3.mp3',
  E3: 'https://tonejs.github.io/audio/salamander/E3.mp3',
  F3: 'https://tonejs.github.io/audio/salamander/F3.mp3',
  'F#3': 'https://tonejs.github.io/audio/salamander/Fs3.mp3',
  G3: 'https://tonejs.github.io/audio/salamander/G3.mp3',
  'G#3': 'https://tonejs.github.io/audio/salamander/Gs3.mp3',
  A3: 'https://tonejs.github.io/audio/salamander/A3.mp3',
  'A#3': 'https://tonejs.github.io/audio/salamander/As3.mp3',
  B3: 'https://tonejs.github.io/audio/salamander/B3.mp3',
  C4: 'https://tonejs.github.io/audio/salamander/C4.mp3',
  'C#4': 'https://tonejs.github.io/audio/salamander/Cs4.mp3',
  D4: 'https://tonejs.github.io/audio/salamander/D4.mp3',
  'D#4': 'https://tonejs.github.io/audio/salamander/Ds4.mp3',
  E4: 'https://tonejs.github.io/audio/salamander/E4.mp3',
  F4: 'https://tonejs.github.io/audio/salamander/F4.mp3',
  'F#4': 'https://tonejs.github.io/audio/salamander/Fs4.mp3',
  G4: 'https://tonejs.github.io/audio/salamander/G4.mp3',
}

async function initializeGuitarSampler(): Promise<void> {
  if (guitarSampler) {
    return
  }

  if (samplerReadyPromise) {
    return samplerReadyPromise
  }

  samplerReadyPromise = (async () => {
    try {
      guitarSampler = new Tone.Sampler({
        urls: GUITAR_SAMPLER_URLS,
        release: 1,
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
      }).toDestination()
    } catch (error) {
      console.error('Failed to initialize guitar sampler:', error)
      throw error
    }
  })()

  return samplerReadyPromise
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
  playNote: (note, startTime, ctx) => {
    const osc = createMidiOscillator(ctx, note.frequency)
    const gain = createMidiEnvelope(ctx, QUARTER_NOTE_DURATION)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + QUARTER_NOTE_DURATION)
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

async function ensureToneContextRunning(): Promise<void> {
  if (Tone.context.state !== 'running') {
    await Tone.start()
  }
}

function calculateToneTime(startTime: number, ctx: AudioContext): string | undefined {
  const delay = Math.max(0, startTime - ctx.currentTime)
  return delay > 0 ? `+${delay}` : undefined
}

async function playGuitarNote(
  note: { noteName?: string; frequency: number },
  startTime: number,
  ctx: AudioContext
): Promise<void> {
  if (!note.noteName) {
    console.warn('No note name provided:', note)
    return
  }

  await initializeGuitarSampler()

  if (!guitarSampler) {
    console.warn('Guitar sampler not ready after initialization')
    return
  }

  await ensureToneContextRunning()

  const toneTime = calculateToneTime(startTime, ctx)
  guitarSampler.triggerAttackRelease(note.noteName, QUARTER_NOTE_DURATION, toneTime)
}

const guitarEngine: AudioEngine = {
  playNote: async (note, startTime, ctx) => {
    try {
      await playGuitarNote(note, startTime, ctx)
    } catch (error) {
      console.error('Error playing guitar note:', error, {
        noteName: note.noteName,
        frequency: note.frequency,
      })
    }
  },
  createEnvelope: createGuitarEnvelope,
}

export function preloadGuitarSampler(): Promise<void> {
  return initializeGuitarSampler()
}

export function getAudioEngine(instrument: InstrumentType): AudioEngine {
  if (instrument === 'guitar') {
    initializeGuitarSampler()
  }

  switch (instrument) {
    case 'guitar':
      return guitarEngine
    case 'midi':
    default:
      return midiEngine
  }
}
