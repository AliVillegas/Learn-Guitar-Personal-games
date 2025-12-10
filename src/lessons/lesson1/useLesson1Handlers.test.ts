import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLesson1Handlers } from './useLesson1Handlers'
import { useLesson1Store } from './lesson1Store'
import { useSettingsStore } from '../../store/settingsStore'
import { createNoteDefinition } from '../../utils/notes'

vi.mock('./useLesson1Audio', () => ({
  useLesson1Audio: () => ({
    playNote: vi.fn().mockResolvedValue(undefined),
    playSequence: vi.fn().mockResolvedValue(undefined),
    playErrorSound: vi.fn(),
    playSuccessSound: vi.fn(),
  }),
}))

vi.mock('../../utils/audioEngines', () => ({
  preloadGuitarSampler: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../hooks/useAnswerFeedback', () => ({
  useAnswerFeedback: () => ({
    setFeedback: vi.fn(),
    reset: vi.fn(),
    feedback: {},
  }),
}))

describe('useLesson1Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLesson1Store.setState({
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
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
      config: {
        stringNotes: [],
        measureCount: 1,
        instrument: 'guitar-classical',
      },
    })
    useSettingsStore.setState({
      playbackBpm: 120,
      instrument: 'guitar-classical',
    })
  })

  it('returns all handlers', () => {
    const { result } = renderHook(() => useLesson1Handlers())

    expect(result.current.game).toBeDefined()
    expect(result.current.audio).toBeDefined()
    expect(result.current.feedback).toBeDefined()
    expect(result.current.handlePlayAll).toBeDefined()
    expect(result.current.handlePlayCurrentNote).toBeDefined()
    expect(result.current.handlePlayMeasure).toBeDefined()
    expect(result.current.handleAnswerSelect).toBeDefined()
    expect(result.current.handleGenerate).toBeDefined()
    expect(result.current.handleChangeInstrument).toBeDefined()
  })

  it('handlePlayAll plays sequence', () => {
    const { result } = renderHook(() => useLesson1Handlers())

    result.current.handlePlayAll()

    expect(result.current.audio.playSequence).toHaveBeenCalled()
  })

  it('handlePlayCurrentNote plays current note', async () => {
    const { result } = renderHook(() => useLesson1Handlers())
    const state = useLesson1Store.getState()

    await result.current.handlePlayCurrentNote()

    expect(result.current.audio.playNote).toHaveBeenCalledWith(
      state.sequence[state.currentIndex].note
    )
  })

  it('handlePlayMeasure plays measure', () => {
    const { result } = renderHook(() => useLesson1Handlers())

    result.current.handlePlayMeasure(0)

    expect(result.current.audio.playSequence).toHaveBeenCalled()
  })

  it('handleGenerate resets feedback and generates sequence', () => {
    const { result } = renderHook(() => useLesson1Handlers())
    const generateSequenceSpy = vi.spyOn(useLesson1Store.getState(), 'generateSequence')

    result.current.handleGenerate()

    expect(result.current.feedback.reset).toHaveBeenCalled()
    expect(generateSequenceSpy).toHaveBeenCalled()
  })

  it('handleChangeInstrument updates stores and preloads guitar sampler', async () => {
    const { result } = renderHook(() => useLesson1Handlers())
    const { preloadGuitarSampler } = await import('../../utils/audioEngines')

    result.current.handleChangeInstrument('guitar-synth')

    expect(useLesson1Store.getState().config.instrument).toBe('guitar-synth')
    expect(useSettingsStore.getState().instrument).toBe('guitar-synth')
    expect(preloadGuitarSampler).toHaveBeenCalled()
  })

  it('handleChangeInstrument does not preload for non-guitar instruments', async () => {
    const { result } = renderHook(() => useLesson1Handlers())
    const { preloadGuitarSampler } = await import('../../utils/audioEngines')
    vi.mocked(preloadGuitarSampler).mockClear()

    result.current.handleChangeInstrument('piano')

    expect(preloadGuitarSampler).not.toHaveBeenCalled()
  })
})
