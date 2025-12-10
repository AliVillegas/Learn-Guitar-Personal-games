import { describe, it, expect, beforeEach } from 'vitest'
import { useLesson1Store } from './lesson1Store'
import { createNoteDefinition } from '../../utils/notes'

describe('useLesson1Store', () => {
  beforeEach(() => {
    useLesson1Store.setState({
      phase: 'config',
      config: {
        stringNotes: [
          { string: 6, notes: ['mi'] },
          { string: 5, notes: ['la'] },
          { string: 4, notes: ['re'] },
          { string: 3, notes: ['sol'] },
          { string: 2, notes: ['si'] },
          { string: 1, notes: ['mi'] },
        ],
        measureCount: 1,
        instrument: 'guitar-classical',
      },
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  describe('setConfig', () => {
    it('updates config with partial values', () => {
      useLesson1Store.getState().setConfig({ measureCount: 2 })

      expect(useLesson1Store.getState().config.measureCount).toBe(2)
      expect(useLesson1Store.getState().config.instrument).toBe('guitar-classical')
    })

    it('updates instrument', () => {
      useLesson1Store.getState().setConfig({ instrument: 'midi' })

      expect(useLesson1Store.getState().config.instrument).toBe('midi')
    })

    it('updates stringNotes', () => {
      const newStringNotes = [
        { string: 6, notes: ['mi', 'fa'] },
        { string: 5, notes: ['la'] },
      ]
      useLesson1Store.getState().setConfig({ stringNotes: newStringNotes })

      expect(useLesson1Store.getState().config.stringNotes).toEqual(newStringNotes)
    })
  })

  describe('generateSequence', () => {
    it('creates sequence with correct number of notes', () => {
      useLesson1Store.getState().generateSequence()

      const state = useLesson1Store.getState()
      expect(state.sequence).toHaveLength(4)
      expect(state.phase).toBe('playing')
      expect(state.currentIndex).toBe(0)
      expect(state.score).toEqual({ correct: 0, incorrect: 0 })
    })

    it('sets first note as active', () => {
      useLesson1Store.getState().generateSequence()

      const state = useLesson1Store.getState()
      expect(state.sequence[0].status).toBe('active')
    })

    it('creates sequence for multiple measures', () => {
      useLesson1Store.getState().setConfig({ measureCount: 2 })
      useLesson1Store.getState().generateSequence()

      const state = useLesson1Store.getState()
      expect(state.sequence).toHaveLength(8)
    })

    it('returns empty sequence when no notes available', () => {
      useLesson1Store.getState().setConfig({
        stringNotes: [
          { string: 6, notes: [] },
          { string: 5, notes: [] },
        ],
      })
      useLesson1Store.getState().generateSequence()

      const state = useLesson1Store.getState()
      expect(state.sequence).toHaveLength(0)
    })
  })

  describe('submitAnswer', () => {
    beforeEach(() => {
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
      })
    })

    it('marks note correct and advances index on correct answer', () => {
      useLesson1Store.getState().submitAnswer('mi')

      const state = useLesson1Store.getState()
      expect(state.sequence[0].status).toBe('correct')
      expect(state.currentIndex).toBe(1)
      expect(state.sequence[1].status).toBe('active')
      expect(state.score.correct).toBe(1)
      expect(state.score.incorrect).toBe(0)
    })

    it('marks note incorrect but does not advance on wrong answer', () => {
      useLesson1Store.getState().submitAnswer('fa')

      const state = useLesson1Store.getState()
      expect(state.sequence[0].status).toBe('incorrect')
      expect(state.currentIndex).toBe(0)
      expect(state.score.correct).toBe(0)
      expect(state.score.incorrect).toBe(1)
    })

    it('transitions to complete when all notes answered correctly', () => {
      useLesson1Store.setState({
        sequence: [
          {
            id: '1',
            note: createNoteDefinition('mi', 3),
            status: 'active',
          },
        ],
        currentIndex: 0,
      })

      useLesson1Store.getState().submitAnswer('mi')

      const state = useLesson1Store.getState()
      expect(state.phase).toBe('complete')
      expect(state.score.correct).toBe(1)
    })

    it('does nothing when phase is not playing', () => {
      useLesson1Store.setState({ phase: 'config' })
      const initialState = useLesson1Store.getState()

      useLesson1Store.getState().submitAnswer('mi')

      const state = useLesson1Store.getState()
      expect(state).toEqual(initialState)
    })

    it('does nothing when current note is undefined', () => {
      useLesson1Store.setState({ currentIndex: 10 })
      const initialState = useLesson1Store.getState()

      useLesson1Store.getState().submitAnswer('mi')

      const state = useLesson1Store.getState()
      expect(state).toEqual(initialState)
    })
  })

  describe('reset', () => {
    it('resets to config phase while keeping config', () => {
      useLesson1Store.setState({
        phase: 'complete',
        sequence: [
          {
            id: '1',
            note: createNoteDefinition('mi', 3),
            status: 'correct',
          },
        ],
        currentIndex: 1,
        score: { correct: 4, incorrect: 2 },
      })

      const configBeforeReset = useLesson1Store.getState().config
      useLesson1Store.getState().reset()

      const state = useLesson1Store.getState()
      expect(state.phase).toBe('config')
      expect(state.sequence).toHaveLength(0)
      expect(state.currentIndex).toBe(0)
      expect(state.score).toEqual({ correct: 0, incorrect: 0 })
      expect(state.config).toEqual(configBeforeReset)
    })
  })
})
