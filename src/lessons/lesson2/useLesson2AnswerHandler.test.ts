import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLesson2AnswerHandler } from './useLesson2AnswerHandler'
import { useLesson2Store } from './lesson2Store'
import { createNoteDefinition } from '../../utils/notes'

const mockPlayNote = vi.fn().mockResolvedValue(undefined)
const mockPlayErrorSound = vi.fn()
const mockPlaySuccessSound = vi.fn()
const mockSetFeedback = vi.fn()

const mockAudio = {
  playNote: mockPlayNote,
  playErrorSound: mockPlayErrorSound,
  playSuccessSound: mockPlaySuccessSound,
}

const mockFeedback = {
  setFeedback: mockSetFeedback,
  reset: vi.fn(),
  feedback: {},
}

describe('createLesson2AnswerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLesson2Store.setState({
      phase: 'playing',
      sequence: [
        {
          id: '1',
          bassVoice: [{ note: createNoteDefinition('fa', 3), duration: 'q' }],
          melodyVoice: [
            { note: createNoteDefinition('mi', 3), duration: 'q' },
            { note: null, duration: 'q' },
          ],
          status: 'active',
        },
        {
          id: '2',
          bassVoice: [],
          melodyVoice: [{ note: createNoteDefinition('fa', 3), duration: 'q' }],
          status: 'pending',
        },
      ],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
      config: {
        stringNotes: [],
        measureCount: 4,
        allowStackedNotes: true,
        instrument: 'guitar-classical',
      },
    })
  })

  it('does nothing when phase is not playing', () => {
    useLesson2Store.setState({ phase: 'config' })
    const game = useLesson2Store.getState()
    const handler = createLesson2AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('mi')

    expect(mockPlayNote).not.toHaveBeenCalled()
    expect(mockSetFeedback).not.toHaveBeenCalled()
  })

  it('does nothing when current note is undefined', () => {
    useLesson2Store.setState({ currentIndex: 10 })
    const game = useLesson2Store.getState()
    const handler = createLesson2AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('mi')

    expect(mockPlayNote).not.toHaveBeenCalled()
    expect(mockSetFeedback).not.toHaveBeenCalled()
  })

  it('handles correct answer', () => {
    const game = useLesson2Store.getState()
    const submitAnswerSpy = vi.spyOn(game, 'submitAnswer')
    const handler = createLesson2AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('mi')

    expect(mockSetFeedback).toHaveBeenCalledWith('mi', 'correct')
    expect(mockPlaySuccessSound).toHaveBeenCalled()
    expect(mockPlayErrorSound).not.toHaveBeenCalled()
    expect(submitAnswerSpy).toHaveBeenCalledWith('mi')
  })

  it('handles incorrect answer', async () => {
    const game = useLesson2Store.getState()
    const submitAnswerSpy = vi.spyOn(game, 'submitAnswer')
    const handler = createLesson2AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('fa')

    expect(mockSetFeedback).toHaveBeenCalledWith('fa', 'incorrect')
    expect(mockPlayErrorSound).toHaveBeenCalled()
    expect(mockPlaySuccessSound).not.toHaveBeenCalled()
    expect(mockPlayNote).toHaveBeenCalled()
    expect(submitAnswerSpy).toHaveBeenCalledWith('fa')
  })

  it('plays all notes from multi-voice note on incorrect answer', async () => {
    const game = useLesson2Store.getState()
    const handler = createLesson2AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('do')

    expect(mockPlayNote).toHaveBeenCalledTimes(2)
  })

  it('handles audio playNote errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPlayNote.mockRejectedValueOnce(new Error('Audio error'))
    const game = useLesson2Store.getState()
    const handler = createLesson2AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('do')

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
