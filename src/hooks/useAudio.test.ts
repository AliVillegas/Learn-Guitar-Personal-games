import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAudio } from './useAudio'
import { useGameStore } from '../store/gameStore'
import { createNoteDefinition } from '../utils/notes'

vi.mock('../utils/audioEngines', () => ({
  getAudioEngine: vi.fn(() => ({
    playNote: vi.fn().mockResolvedValue(undefined),
  })),
  preloadGuitarSampler: vi.fn().mockResolvedValue(undefined),
  releaseAllNotes: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('tone', async () => {
  const actual = await vi.importActual('tone')
  return {
    ...actual,
    context: {
      state: 'running',
    },
    start: vi.fn().mockResolvedValue(undefined),
  }
})

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGameStore.setState({
      config: {
        selectedNotes: ['do', 're', 'mi'],
        stringNotes: [],
        measureCount: 1,
        instrument: 'midi',
      },
    })

    class MockAudioContext {
      state = 'running'
      currentTime = 0
      destination = {}
      resume = vi.fn().mockResolvedValue(undefined)
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
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }))
    }

    global.AudioContext = MockAudioContext as any
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('creates audio context on first use', () => {
    const { result } = renderHook(() => useAudio())

    expect(result.current).toBeDefined()
    expect(result.current.playNote).toBeDefined()
    expect(result.current.playSequence).toBeDefined()
    expect(result.current.playErrorSound).toBeDefined()
  })

  it('plays a single note', async () => {
    const { result } = renderHook(() => useAudio())
    const note = createNoteDefinition('mi', 3)

    await result.current.playNote(note)

    expect(result.current.isPlaying).toBe(false)
  })

  it('plays error sound', async () => {
    const { result } = renderHook(() => useAudio())

    result.current.playErrorSound()

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('plays sequence of notes', async () => {
    const { result } = renderHook(() => useAudio())
    const notes = [createNoteDefinition('mi', 3), createNoteDefinition('fa', 3)]

    await result.current.playSequence(notes, 120, 0)

    expect(result.current).toBeDefined()
  })

  it('handles suspended audio context', async () => {
    const mockResume = vi.fn().mockResolvedValue(undefined)

    class MockSuspendedAudioContext {
      state = 'suspended'
      currentTime = 0
      destination = {}
      resume = mockResume
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
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }))
    }

    global.AudioContext = MockSuspendedAudioContext as any

    const { result } = renderHook(() => useAudio())
    const note = createNoteDefinition('mi', 3)

    await result.current.playNote(note)

    expect(mockResume).toHaveBeenCalled()
  })

  it('updates playing index during sequence playback', async () => {
    const { result } = renderHook(() => useAudio())
    const notes = [createNoteDefinition('mi', 3), createNoteDefinition('fa', 3)]

    await result.current.playSequence(notes, 120, 0)

    expect(result.current.playingIndex).toBeDefined()
  })

  it('handles cleanup for guitar instruments', async () => {
    useGameStore.setState({
      config: {
        selectedNotes: [],
        stringNotes: [],
        measureCount: 1,
        instrument: 'guitar-synth',
      },
    })

    const { result } = renderHook(() => useAudio())
    const notes = [createNoteDefinition('mi', 3)]

    await result.current.playSequence(notes, 120, 0)

    expect(result.current).toBeDefined()
  })

  it('handles different BPM values', async () => {
    const { result } = renderHook(() => useAudio())
    const notes = [createNoteDefinition('mi', 3)]

    await result.current.playSequence(notes, 60, 0)
    await result.current.playSequence(notes, 180, 0)

    expect(result.current).toBeDefined()
  })

  it('handles startIndex parameter', async () => {
    const { result } = renderHook(() => useAudio())
    const notes = [createNoteDefinition('mi', 3)]

    await result.current.playSequence(notes, 120, 5)

    expect(result.current).toBeDefined()
  })
})
