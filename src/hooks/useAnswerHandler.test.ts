import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAnswerHandler } from './useAnswerHandler'
import { useGameStore } from '../store/gameStore'
import { createNoteDefinition } from '../utils/notes'

vi.mock('./useAudio', () => ({
  useAudio: () => ({
    playNote: vi.fn().mockResolvedValue(undefined),
    playErrorSound: vi.fn(),
    playSequence: vi.fn(),
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

describe('createAnswerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('does nothing when phase is not playing', () => {
    useGameStore.setState({ phase: 'config' })
    const game = useGameStore.getState()
    const audio = { playNote: vi.fn(), playErrorSound: vi.fn() }
    const feedback = { setFeedback: vi.fn() }
    const handler = createAnswerHandler(game, audio as any, feedback as any)

    handler('mi')

    expect(audio.playNote).not.toHaveBeenCalled()
    expect(feedback.setFeedback).not.toHaveBeenCalled()
  })

  it('does nothing when current note is undefined', () => {
    useGameStore.setState({ currentIndex: 10 })
    const game = useGameStore.getState()
    const audio = { playNote: vi.fn(), playErrorSound: vi.fn() }
    const feedback = { setFeedback: vi.fn() }
    const handler = createAnswerHandler(game, audio as any, feedback as any)

    handler('mi')

    expect(audio.playNote).not.toHaveBeenCalled()
  })

  it('sets correct feedback and plays next note for correct answer', () => {
    const game = useGameStore.getState()
    const audio = { playNote: vi.fn().mockResolvedValue(undefined), playErrorSound: vi.fn() }
    const feedback = { setFeedback: vi.fn() }
    const handler = createAnswerHandler(game, audio as any, feedback as any)

    handler('mi')

    expect(feedback.setFeedback).toHaveBeenCalledWith('mi', 'correct')
    expect(audio.playNote).toHaveBeenCalledWith(createNoteDefinition('fa', 3))
    expect(audio.playErrorSound).not.toHaveBeenCalled()
  })

  it('does not play next note when game is complete after correct answer', () => {
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
      score: { correct: 0, incorrect: 0 },
    })
    const game = useGameStore.getState()
    const audio = { playNote: vi.fn().mockResolvedValue(undefined), playErrorSound: vi.fn() }
    const feedback = { setFeedback: vi.fn() }
    const handler = createAnswerHandler(game, audio as any, feedback as any)

    handler('mi')

    expect(feedback.setFeedback).toHaveBeenCalledWith('mi', 'correct')
    expect(audio.playNote).not.toHaveBeenCalled()
  })

  it('plays note and sets incorrect feedback for wrong answer', () => {
    const game = useGameStore.getState()
    const audio = { playNote: vi.fn().mockResolvedValue(undefined), playErrorSound: vi.fn() }
    const feedback = { setFeedback: vi.fn() }
    const handler = createAnswerHandler(game, audio as any, feedback as any)

    handler('fa')

    expect(audio.playNote).toHaveBeenCalledWith(createNoteDefinition('mi', 3))
    expect(feedback.setFeedback).toHaveBeenCalledWith('fa', 'incorrect')
    expect(audio.playErrorSound).toHaveBeenCalled()
  })

  it('submits answer to game store', () => {
    const game = useGameStore.getState()
    const submitAnswerSpy = vi.spyOn(game, 'submitAnswer')
    const audio = { playNote: vi.fn().mockResolvedValue(undefined), playErrorSound: vi.fn() }
    const feedback = { setFeedback: vi.fn() }
    const handler = createAnswerHandler(game, audio as any, feedback as any)

    handler('mi')

    expect(submitAnswerSpy).toHaveBeenCalledWith('mi')
  })

  it('handles audio playNote errors gracefully', async () => {
    const game = useGameStore.getState()
    const audio = {
      playNote: vi.fn().mockRejectedValue(new Error('Audio error')),
      playErrorSound: vi.fn(),
    }
    const feedback = { setFeedback: vi.fn() }
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const handler = createAnswerHandler(game, audio as any, feedback as any)

    handler('fa')

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
