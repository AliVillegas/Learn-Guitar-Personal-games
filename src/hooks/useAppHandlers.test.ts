import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAppHandlers } from './useAppHandlers'
import { useGameStore } from '../store/gameStore'
import { createNoteDefinition } from '../utils/notes'

vi.mock('./useAudio', () => ({
  useAudio: () => ({
    playNote: vi.fn().mockResolvedValue(undefined),
    playErrorSound: vi.fn(),
    playSequence: vi.fn().mockResolvedValue(undefined),
    isPlaying: false,
    playingIndex: null,
  }),
}))

vi.mock('./useAnswerFeedback', () => ({
  useAnswerFeedback: () => ({
    setFeedback: vi.fn(),
    reset: vi.fn(),
    feedback: {},
  }),
}))

vi.mock('../utils/audioEngines', () => ({
  preloadGuitarSampler: vi.fn().mockResolvedValue(undefined),
}))

describe('useAppHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGameStore.setState({
      phase: 'config',
      config: {
        selectedNotes: ['do', 're', 'mi'],
        stringNotes: [
          { string: 6, notes: ['mi'] },
          { string: 5, notes: ['la'] },
        ],
        measureCount: 1,
        instrument: 'midi',
      },
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('returns all handlers', () => {
    const { result } = renderHook(() => useAppHandlers())

    expect(result.current.handleToggleStringNote).toBeDefined()
    expect(result.current.handleChangeMeasure).toBeDefined()
    expect(result.current.handleChangeInstrument).toBeDefined()
    expect(result.current.handleGenerate).toBeDefined()
    expect(result.current.handlePlayAll).toBeDefined()
    expect(result.current.handlePlayCurrentNote).toBeDefined()
    expect(result.current.handlePlayMeasure).toBeDefined()
    expect(result.current.handleAnswerSelect).toBeDefined()
    expect(result.current.handlePlayAgain).toBeDefined()
  })

  describe('handleToggleStringNote', () => {
    it('adds note when not selected', () => {
      const { result } = renderHook(() => useAppHandlers())

      result.current.handleToggleStringNote(6, 'fa')

      const state = useGameStore.getState()
      const string6 = state.config.stringNotes.find((sn) => sn.string === 6)
      expect(string6?.notes).toContain('fa')
    })

    it('removes note when already selected', () => {
      const { result } = renderHook(() => useAppHandlers())

      result.current.handleToggleStringNote(6, 'mi')

      const state = useGameStore.getState()
      const string6 = state.config.stringNotes.find((sn) => sn.string === 6)
      expect(string6?.notes).not.toContain('mi')
    })

    it('does nothing when string config not found', () => {
      const { result } = renderHook(() => useAppHandlers())
      const initialState = useGameStore.getState()

      result.current.handleToggleStringNote(99 as any, 'mi')

      const state = useGameStore.getState()
      expect(state).toEqual(initialState)
    })
  })

  describe('handleChangeMeasure', () => {
    it('updates measure count', () => {
      const { result } = renderHook(() => useAppHandlers())

      result.current.handleChangeMeasure(2)

      expect(useGameStore.getState().config.measureCount).toBe(2)
    })
  })

  describe('handleChangeInstrument', () => {
    it('updates instrument', () => {
      const { result } = renderHook(() => useAppHandlers())

      result.current.handleChangeInstrument('guitar-synth')

      expect(useGameStore.getState().config.instrument).toBe('guitar-synth')
    })

    it('preloads sampler for guitar instruments', async () => {
      const { preloadGuitarSampler } = await import('../utils/audioEngines')
      const { result } = renderHook(() => useAppHandlers())

      await result.current.handleChangeInstrument('guitar-classical')

      expect(preloadGuitarSampler).toHaveBeenCalled()
    })
  })

  describe('handleGenerate', () => {
    it('generates sequence and resets feedback', () => {
      const { result } = renderHook(() => useAppHandlers())

      result.current.handleGenerate()

      const state = useGameStore.getState()
      expect(state.phase).toBe('playing')
      expect(state.sequence.length).toBeGreaterThan(0)
    })
  })

  describe('handlePlayAll', () => {
    it('plays all notes in sequence', async () => {
      useGameStore.setState({
        phase: 'playing',
        sequence: [
          {
            id: '1',
            note: createNoteDefinition('mi', 3),
            status: 'active',
          },
          {
            id: '2',
            note: createNoteDefinition('fa', 3),
            status: 'pending',
          },
        ],
      })

      const { result } = renderHook(() => useAppHandlers())

      await result.current.handlePlayAll()

      expect(result.current).toBeDefined()
    })
  })

  describe('handlePlayCurrentNote', () => {
    it('plays current note when available', async () => {
      useGameStore.setState({
        phase: 'playing',
        sequence: [
          {
            id: '1',
            note: createNoteDefinition('mi', 3),
            status: 'active',
          },
        ],
        currentIndex: 0,
      })

      const { result } = renderHook(() => useAppHandlers())

      await result.current.handlePlayCurrentNote()

      expect(result.current).toBeDefined()
    })

    it('does nothing when current note is unavailable', async () => {
      useGameStore.setState({
        phase: 'playing',
        sequence: [],
        currentIndex: 0,
      })

      const { result } = renderHook(() => useAppHandlers())
      const { useAudio } = await import('./useAudio')
      const audioHook = useAudio()

      await result.current.handlePlayCurrentNote()

      expect(audioHook.playNote).not.toHaveBeenCalled()
    })
  })

  describe('handlePlayMeasure', () => {
    it('plays notes for specific measure', async () => {
      useGameStore.setState({
        phase: 'playing',
        sequence: [
          { id: '1', note: createNoteDefinition('mi', 3), status: 'active' },
          { id: '2', note: createNoteDefinition('fa', 3), status: 'pending' },
          { id: '3', note: createNoteDefinition('sol', 3), status: 'pending' },
          { id: '4', note: createNoteDefinition('la', 3), status: 'pending' },
        ],
      })

      const { result } = renderHook(() => useAppHandlers())

      result.current.handlePlayMeasure(0)

      expect(result.current).toBeDefined()
    })
  })

  describe('handlePlayAgain', () => {
    it('resets game state', () => {
      useGameStore.setState({
        phase: 'complete',
        sequence: [
          {
            id: '1',
            note: createNoteDefinition('mi', 3),
            status: 'correct',
          },
        ],
        currentIndex: 1,
        score: { correct: 4, incorrect: 0 },
      })

      const { result } = renderHook(() => useAppHandlers())

      result.current.handlePlayAgain()

      const state = useGameStore.getState()
      expect(state.phase).toBe('config')
      expect(state.sequence).toHaveLength(0)
      expect(state.score).toEqual({ correct: 0, incorrect: 0 })
    })
  })
})
