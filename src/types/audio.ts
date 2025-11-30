export type InstrumentType = 'midi' | 'guitar'

export interface AudioEngine {
  playNote: (note: { frequency: number }, startTime: number, ctx: AudioContext) => void
  createEnvelope: (ctx: AudioContext, duration: number) => GainNode
}
