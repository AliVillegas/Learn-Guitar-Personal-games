import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLesson1AnswerHandler } from './useLesson1AnswerHandler'
import { useLesson1Store } from './lesson1Store'
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

describe('createLesson1AnswerHandler', () => {
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
  })

  it('does nothing when phase is not playing', () => {
    useLesson1Store.setState({ phase: 'config' })
    const game = useLesson1Store.getState()
    const handler = createLesson1AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('mi')

    expect(mockPlayNote).not.toHaveBeenCalled()
    expect(mockSetFeedback).not.toHaveBeenCalled()
  })

  it('does nothing when current note is undefined', () => {
    useLesson1Store.setState({ currentIndex: 10 })
    const game = useLesson1Store.getState()
    const handler = createLesson1AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('mi')

    expect(mockPlayNote).not.toHaveBeenCalled()
    expect(mockSetFeedback).not.toHaveBeenCalled()
  })

  it('handles correct answer', () => {
    const game = useLesson1Store.getState()
    const submitAnswerSpy = vi.spyOn(game, 'submitAnswer')
    const handler = createLesson1AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('mi')

    expect(mockSetFeedback).toHaveBeenCalledWith('mi', 'correct')
    expect(mockPlaySuccessSound).toHaveBeenCalled()
    expect(mockPlayErrorSound).not.toHaveBeenCalled()
    expect(mockPlayNote).not.toHaveBeenCalled()
    expect(submitAnswerSpy).toHaveBeenCalledWith('mi')
  })

  it('handles incorrect answer', async () => {
    const game = useLesson1Store.getState()
    const submitAnswerSpy = vi.spyOn(game, 'submitAnswer')
    const handler = createLesson1AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('fa')

    expect(mockSetFeedback).toHaveBeenCalledWith('fa', 'incorrect')
    expect(mockPlayErrorSound).toHaveBeenCalled()
    expect(mockPlaySuccessSound).not.toHaveBeenCalled()
    expect(mockPlayNote).toHaveBeenCalledWith(createNoteDefinition('mi', 3))
    expect(submitAnswerSpy).toHaveBeenCalledWith('fa')
  })

  it('handles audio playNote errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPlayNote.mockRejectedValueOnce(new Error('Audio error'))
    const game = useLesson1Store.getState()
    const handler = createLesson1AnswerHandler(game, mockAudio as any, mockFeedback as any)

    handler('fa')

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
