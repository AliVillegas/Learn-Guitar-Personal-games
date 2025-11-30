export type InstrumentType = 'midi' | 'guitar'

export interface AudioEngine {
  playNote: (
    note: { frequency: number; noteName?: string },
    startTime: number,
    ctx: AudioContext
  ) => void | Promise<void>
  createEnvelope: (ctx: AudioContext, duration: number) => GainNode
}
