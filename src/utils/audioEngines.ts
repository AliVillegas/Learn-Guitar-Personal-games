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

function createClassicalGuitarUrls(): Record<string, string> {
  return {
    'C#3': 'Cs3.mp3',
    D3: 'D3.mp3',
    'D#4': 'Ds4.mp3',
    E3: 'E3.mp3',
    E4: 'E4.mp3',
    'F#3': 'Fs3.mp3',
    'F#4': 'Fs4.mp3',
    G3: 'G3.mp3',
    'G#4': 'Gs4.mp3',
    A3: 'A3.mp3',
    B3: 'B3.mp3',
    'C#4': 'Cs4.mp3',
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
      const urls = createClassicalGuitarUrls()
      guitarClassicalSampler = new Tone.Sampler({
        urls,
        release: 1,
        baseUrl: GUITAR_CLASSICAL_SAMPLES_BASE_URL,
      }).toDestination()
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

async function playGuitarSynthNote(
  note: { noteName?: string; frequency: number },
  startTime: number,
  ctx: AudioContext
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

  guitarSynth.releaseAll()

  const delay = Math.max(0, startTime - ctx.currentTime)

  if (delay > 0) {
    const toneTime = Tone.now() + delay
    guitarSynth.triggerAttackRelease(note.noteName, QUARTER_NOTE_DURATION, toneTime)
  } else {
    guitarSynth.triggerAttackRelease(note.noteName, QUARTER_NOTE_DURATION)
  }
}

async function playGuitarClassicalNote(
  note: { noteName?: string; frequency: number },
  startTime: number,
  ctx: AudioContext
): Promise<void> {
  if (!note.noteName) {
    console.warn('No note name provided:', note)
    return
  }

  await initializeGuitarClassicalSampler()

  if (!guitarClassicalSampler) {
    console.warn('Classical guitar sampler not ready after initialization')
    return
  }

  await ensureToneContextRunning()

  guitarClassicalSampler.releaseAll()

  const delay = Math.max(0, startTime - ctx.currentTime)

  if (delay > 0) {
    const toneTime = Tone.now() + delay
    guitarClassicalSampler.triggerAttackRelease(note.noteName, QUARTER_NOTE_DURATION, toneTime)
  } else {
    guitarClassicalSampler.triggerAttackRelease(note.noteName, QUARTER_NOTE_DURATION)
  }
}

const guitarSynthEngine: AudioEngine = {
  playNote: async (note, startTime, ctx) => {
    try {
      await playGuitarSynthNote(note, startTime, ctx)
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
  playNote: async (note, startTime, ctx) => {
    try {
      await playGuitarClassicalNote(note, startTime, ctx)
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
