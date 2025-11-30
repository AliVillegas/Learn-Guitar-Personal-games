import * as Tone from 'tone'
import type { AudioEngine, InstrumentType } from '../types/audio'

const QUARTER_NOTE_DURATION = 0.4

let guitarSynth: Tone.PolySynth<Tone.Synth> | null = null
let synthReadyPromise: Promise<void> | null = null

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

  await initializeGuitarSynth()

  if (!guitarSynth) {
    console.warn('Guitar synth not ready after initialization')
    return
  }

  await ensureToneContextRunning()

  const toneTime = calculateToneTime(startTime, ctx)
  guitarSynth.triggerAttackRelease(note.noteName, QUARTER_NOTE_DURATION, toneTime)
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
  return initializeGuitarSynth()
}

export function getAudioEngine(instrument: InstrumentType): AudioEngine {
  if (instrument === 'guitar') {
    initializeGuitarSynth()
  }

  switch (instrument) {
    case 'guitar':
      return guitarEngine
    case 'midi':
    default:
      return midiEngine
  }
}
