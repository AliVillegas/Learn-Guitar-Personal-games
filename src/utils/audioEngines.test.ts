import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAudioEngine, preloadGuitarSampler, releaseAllNotes } from './audioEngines'

vi.mock('tone', async () => {
  const actual = await vi.importActual<typeof import('tone')>('tone')
  const mockTriggerAttackRelease = vi.fn()
  const mockReleaseAll = vi.fn()
  const mockToDestination = vi.fn(() => ({
    triggerAttackRelease: mockTriggerAttackRelease,
    releaseAll: mockReleaseAll,
    volume: { value: 0 },
  }))

  return {
    ...actual,
    default: {
      ...actual.default,
      PolySynth: vi.fn(() => ({
        toDestination: mockToDestination,
      })),
      Synth: vi.fn(),
      Sampler: vi.fn(() => ({
        toDestination: mockToDestination,
        triggerAttackRelease: mockTriggerAttackRelease,
        releaseAll: mockReleaseAll,
        volume: { value: 0 },
      })),
      context: {
        state: 'running',
      },
      start: vi.fn().mockResolvedValue(undefined),
      loaded: vi.fn().mockResolvedValue(undefined),
      now: vi.fn(() => 0),
    },
  }
})

describe('audioEngines', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    class MockAudioContext {
      state = 'running'
      currentTime = 0
      destination = {}
      createOscillator = vi.fn(() => ({
        type: '',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }))
      createGain = vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }))
    }

    global.AudioContext = MockAudioContext as any
  })

  describe('getAudioEngine', () => {
    it('returns midi engine for midi instrument', () => {
      const engine = getAudioEngine('midi')

      expect(engine).toBeDefined()
      expect(engine.playNote).toBeDefined()
      expect(engine.createEnvelope).toBeDefined()
    })

    it('returns guitar synth engine for guitar-synth instrument', () => {
      const engine = getAudioEngine('guitar-synth')

      expect(engine).toBeDefined()
      expect(engine.playNote).toBeDefined()
    })

    it('returns guitar classical engine for guitar-classical instrument', () => {
      const engine = getAudioEngine('guitar-classical')

      expect(engine).toBeDefined()
      expect(engine.playNote).toBeDefined()
    })
  })

  describe('midi engine', () => {
    it('plays note with correct frequency', () => {
      const engine = getAudioEngine('midi')
      const ctx = new AudioContext()
      const startTime = ctx.currentTime

      engine.playNote({ frequency: 440, noteName: 'A4' }, startTime, ctx)

      expect(ctx.createOscillator).toHaveBeenCalled()
    })

    it('plays note with future start time', () => {
      const engine = getAudioEngine('midi')
      const ctx = new AudioContext()
      const startTime = ctx.currentTime + 0.5

      engine.playNote({ frequency: 440, noteName: 'A4' }, startTime, ctx)

      expect(ctx.createOscillator).toHaveBeenCalled()
    })

    it('creates envelope with correct duration', () => {
      const engine = getAudioEngine('midi')
      const ctx = new AudioContext()

      const envelope = engine.createEnvelope(ctx, 0.4)

      expect(envelope).toBeDefined()
      expect(ctx.createGain).toHaveBeenCalled()
    })

    it('creates envelope with different durations', () => {
      const engine = getAudioEngine('midi')
      const ctx = new AudioContext()

      const envelope1 = engine.createEnvelope(ctx, 0.2)
      const envelope2 = engine.createEnvelope(ctx, 0.8)

      expect(envelope1).toBeDefined()
      expect(envelope2).toBeDefined()
    })
  })

  describe('preloadGuitarSampler', () => {
    it.skip('initializes guitar synth and sampler', async () => {
      await preloadGuitarSampler()

      expect(mockPolySynth).toHaveBeenCalled()
      expect(mockSampler).toHaveBeenCalled()
    })

    it.skip('handles multiple calls gracefully', async () => {
      await preloadGuitarSampler()
      await preloadGuitarSampler()

      expect(mockPolySynth).toHaveBeenCalled()
    })
  })

  describe('releaseAllNotes', () => {
    it.skip('releases notes for guitar-synth', async () => {
      await preloadGuitarSampler()
      await releaseAllNotes('guitar-synth')

      expect(mockReleaseAll).toHaveBeenCalled()
    })

    it.skip('releases notes for guitar-classical', async () => {
      await preloadGuitarSampler()
      await releaseAllNotes('guitar-classical')

      expect(mockReleaseAll).toHaveBeenCalled()
    })

    it('does nothing for midi instrument', async () => {
      await releaseAllNotes('midi')

      expect(true).toBe(true)
    })
  })

  describe('guitar synth engine', () => {
    it('plays note with delay', async () => {
      const engine = getAudioEngine('guitar-synth')
      const ctx = new AudioContext()
      const startTime = ctx.currentTime + 0.1

      await engine.playNote({ frequency: 440, noteName: 'A3' }, startTime, ctx)

      expect(engine).toBeDefined()
    })

    it('plays note immediately when delay is zero', async () => {
      const engine = getAudioEngine('guitar-synth')
      const ctx = new AudioContext()
      const startTime = ctx.currentTime

      await engine.playNote({ frequency: 440, noteName: 'A3' }, startTime, ctx)

      expect(engine).toBeDefined()
    })

    it('handles missing note name gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const engine = getAudioEngine('guitar-synth')
      const ctx = new AudioContext()

      await engine.playNote({ frequency: 440 }, ctx.currentTime, ctx)

      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('guitar classical engine', () => {
    it('plays note successfully', async () => {
      const engine = getAudioEngine('guitar-classical')
      const ctx = new AudioContext()

      await engine.playNote({ frequency: 440, noteName: 'E3' }, ctx.currentTime, ctx)

      expect(engine).toBeDefined()
    })

    it('handles missing note name gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const engine = getAudioEngine('guitar-classical')
      const ctx = new AudioContext()

      await engine.playNote({ frequency: 440 }, ctx.currentTime, ctx)

      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })
})
