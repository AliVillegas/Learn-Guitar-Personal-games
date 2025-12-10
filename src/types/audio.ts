export type InstrumentType = 'midi' | 'guitar-synth' | 'guitar-classical'

export interface AudioEngine {
  playNote: (
    note: { frequency: number; noteName?: string },
    startTime: number,
    ctx: AudioContext,
    duration?: number
  ) => void | Promise<void>
  createEnvelope: (ctx: AudioContext, duration: number) => GainNode
}
