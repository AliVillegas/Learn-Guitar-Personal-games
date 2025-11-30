import type { AudioEngine, InstrumentType } from '../types/audio'

const QUARTER_NOTE_DURATION = 0.4

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

function createGuitarOscillators(ctx: AudioContext, frequency: number): OscillatorNode[] {
  const oscillators: OscillatorNode[] = []

  const fundamental = ctx.createOscillator()
  fundamental.type = 'sawtooth'
  fundamental.frequency.value = frequency
  oscillators.push(fundamental)

  const harmonic2 = ctx.createOscillator()
  harmonic2.type = 'sawtooth'
  harmonic2.frequency.value = frequency * 2
  oscillators.push(harmonic2)

  const detuned = ctx.createOscillator()
  detuned.type = 'sawtooth'
  detuned.frequency.value = frequency * 1.01
  oscillators.push(detuned)

  return oscillators
}

function createGuitarFilter(ctx: AudioContext, frequency: number): BiquadFilterNode {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = frequency * 3
  filter.Q.value = 1
  return filter
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

function createGuitarReverb(ctx: AudioContext): ConvolverNode {
  const convolver = ctx.createConvolver()
  const length = ctx.sampleRate * 0.3
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      const n = length - i
      channelData[i] = (Math.random() * 2 - 1) * (n / length) * 0.1
    }
  }

  convolver.buffer = impulse
  return convolver
}

const guitarEngine: AudioEngine = {
  playNote: (note, startTime, ctx) => {
    const oscillators = createGuitarOscillators(ctx, note.frequency)
    const filter = createGuitarFilter(ctx, note.frequency)
    const envelope = createGuitarEnvelope(ctx, QUARTER_NOTE_DURATION)
    const reverb = createGuitarReverb(ctx)

    oscillators.forEach((osc) => {
      osc.connect(filter)
    })

    filter.connect(envelope)
    envelope.connect(reverb)
    reverb.connect(ctx.destination)

    oscillators.forEach((osc) => {
      osc.start(startTime)
      osc.stop(startTime + QUARTER_NOTE_DURATION)
    })
  },
  createEnvelope: createGuitarEnvelope,
}

export function getAudioEngine(instrument: InstrumentType): AudioEngine {
  switch (instrument) {
    case 'guitar':
      return guitarEngine
    case 'midi':
    default:
      return midiEngine
  }
}
