import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLesson2Handlers } from './useLesson2Handlers'
import { useLesson2Store } from './lesson2Store'
import { useSettingsStore } from '../../store/settingsStore'
import { createNoteDefinition } from '../../utils/notes'

vi.mock('./useLesson2Audio', () => ({
  useLesson2Audio: () => ({
    playNote: vi.fn().mockResolvedValue(undefined),
    playTimedSequence: vi.fn().mockResolvedValue(undefined),
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

describe('useLesson2Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLesson2Store.setState({
      phase: 'playing',
      sequence: [
        {
          id: '1',
          bassVoice: [{ note: createNoteDefinition('fa', 3), duration: 'q' }],
          melodyVoice: [{ note: createNoteDefinition('mi', 3), duration: 'q' }],
          status: 'active',
        },
      ],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
      config: {
        measureCount: 4,
        noteMode: 'single',
      },
    })
    useSettingsStore.setState({
      playbackBpm: 120,
      instrument: 'guitar-classical',
    })
  })

  it('returns all handlers', () => {
    const { result } = renderHook(() => useLesson2Handlers())

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

  it('handlePlayAll plays timed sequence', () => {
    const { result } = renderHook(() => useLesson2Handlers())

    result.current.handlePlayAll()

    expect(result.current.audio.playTimedSequence).toHaveBeenCalled()
  })

  it('handlePlayCurrentNote plays all notes from current multi-voice note', async () => {
    const { result } = renderHook(() => useLesson2Handlers())

    await result.current.handlePlayCurrentNote()

    expect(result.current.audio.playNote).toHaveBeenCalled()
  })

  it('handlePlayMeasure plays measure', () => {
    const { result } = renderHook(() => useLesson2Handlers())

    result.current.handlePlayMeasure(0)

    expect(result.current.audio.playTimedSequence).toHaveBeenCalled()
  })

  it('handleGenerate resets feedback and generates sequence', () => {
    const { result } = renderHook(() => useLesson2Handlers())
    const generateSequenceSpy = vi.spyOn(useLesson2Store.getState(), 'generateSequence')

    result.current.handleGenerate()

    expect(result.current.feedback.reset).toHaveBeenCalled()
    expect(generateSequenceSpy).toHaveBeenCalled()
  })

  it('handleChangeInstrument updates settings store and preloads guitar sampler', async () => {
    const { result } = renderHook(() => useLesson2Handlers())
    const { preloadGuitarSampler } = await import('../../utils/audioEngines')

    result.current.handleChangeInstrument('guitar-synth')

    expect(useSettingsStore.getState().instrument).toBe('guitar-synth')
    expect(preloadGuitarSampler).toHaveBeenCalled()
  })

  it('handleChangeInstrument does not preload for non-guitar instruments', async () => {
    const { result } = renderHook(() => useLesson2Handlers())
    const { preloadGuitarSampler } = await import('../../utils/audioEngines')
    vi.mocked(preloadGuitarSampler).mockClear()

    result.current.handleChangeInstrument('piano')

    expect(preloadGuitarSampler).not.toHaveBeenCalled()
  })
})
