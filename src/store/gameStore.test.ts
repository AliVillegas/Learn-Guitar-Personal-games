import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { createNoteDefinition } from '../utils/notes'

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: 'config',
      config: {
        lessonType: 'single-notes',
        singleNotes: {
          selectedNotes: ['do', 're', 'mi'],
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
        multiVoice: {
          stringNotes: [
            { string: 6, notes: ['mi'] },
            { string: 5, notes: ['la'] },
            { string: 4, notes: ['re'] },
            { string: 3, notes: ['sol'] },
            { string: 2, notes: ['si'] },
            { string: 1, notes: ['mi'] },
          ],
          measureCount: 4,
          melodyStrings: 'both',
          instrument: 'guitar-classical',
        },
      },
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  describe('setConfig', () => {
    it('updates config with partial values', () => {
      useGameStore.getState().setConfig({
        singleNotes: {
          ...useGameStore.getState().config.singleNotes,
          measureCount: 2,
        },
      })

      const state = useGameStore.getState()
      expect(state.config.singleNotes.measureCount).toBe(2)
      expect(state.config.singleNotes.selectedNotes).toEqual(['do', 're', 'mi'])
    })

    it('updates instrument', () => {
      useGameStore.getState().setConfig({
        singleNotes: {
          ...useGameStore.getState().config.singleNotes,
          instrument: 'midi',
        },
      })

      const state = useGameStore.getState()
      expect(state.config.singleNotes.instrument).toBe('midi')
    })

    it('updates stringNotes', () => {
      const newStringNotes = [
        { string: 6, notes: ['mi', 'fa'] },
        { string: 5, notes: ['la'] },
      ]
      useGameStore.getState().setConfig({
        singleNotes: {
          ...useGameStore.getState().config.singleNotes,
          stringNotes: newStringNotes,
        },
      })

      const state = useGameStore.getState()
      expect(state.config.singleNotes.stringNotes).toEqual(newStringNotes)
    })
  })

  describe('generateSequence', () => {
    it('creates sequence with correct number of notes', () => {
      useGameStore.getState().generateSequence()

      const state = useGameStore.getState()
      expect(state.sequence).toHaveLength(4)
      expect(state.phase).toBe('playing')
      expect(state.currentIndex).toBe(0)
      expect(state.score).toEqual({ correct: 0, incorrect: 0 })
    })

    it('sets first note as active', () => {
      useGameStore.getState().generateSequence()

      const state = useGameStore.getState()
      expect(state.sequence[0].status).toBe('active')
    })

    it('creates sequence for multiple measures', () => {
      useGameStore.getState().setConfig({
        singleNotes: {
          ...useGameStore.getState().config.singleNotes,
          measureCount: 2,
        },
      })
      useGameStore.getState().generateSequence()

      const state = useGameStore.getState()
      expect(state.sequence).toHaveLength(8)
    })

    it('returns empty sequence when no notes available', () => {
      useGameStore.getState().setConfig({
        singleNotes: {
          ...useGameStore.getState().config.singleNotes,
          stringNotes: [
            { string: 6, notes: [] },
            { string: 5, notes: [] },
          ],
        },
      })
      useGameStore.getState().generateSequence()

      const state = useGameStore.getState()
      expect(state.sequence).toHaveLength(0)
    })
  })

  describe('submitAnswer', () => {
    beforeEach(() => {
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

    it('marks note correct and advances index on correct answer', () => {
      useGameStore.getState().submitAnswer('mi')

      const state = useGameStore.getState()
      expect(state.sequence[0].status).toBe('correct')
      expect(state.currentIndex).toBe(1)
      expect(state.sequence[1].status).toBe('active')
      expect(state.score.correct).toBe(1)
      expect(state.score.incorrect).toBe(0)
    })

    it('marks note incorrect but does not advance on wrong answer', () => {
      useGameStore.getState().submitAnswer('fa')

      const state = useGameStore.getState()
      expect(state.sequence[0].status).toBe('incorrect')
      expect(state.currentIndex).toBe(0)
      expect(state.score.correct).toBe(0)
      expect(state.score.incorrect).toBe(1)
    })

    it('transitions to complete when all notes answered correctly', () => {
      useGameStore.setState({
        sequence: [
          {
            id: '1',
            note: createNoteDefinition('mi', 3),
            status: 'active',
          },
        ],
        currentIndex: 0,
      })

      useGameStore.getState().submitAnswer('mi')

      const state = useGameStore.getState()
      expect(state.phase).toBe('complete')
      expect(state.score.correct).toBe(1)
    })

    it('does nothing when phase is not playing', () => {
      useGameStore.setState({ phase: 'config' })
      const initialState = useGameStore.getState()

      useGameStore.getState().submitAnswer('mi')

      const state = useGameStore.getState()
      expect(state).toEqual(initialState)
    })

    it('does nothing when current note is undefined', () => {
      useGameStore.setState({ currentIndex: 10 })
      const initialState = useGameStore.getState()

      useGameStore.getState().submitAnswer('mi')

      const state = useGameStore.getState()
      expect(state).toEqual(initialState)
    })
  })

  describe('reset', () => {
    it('resets to config phase while keeping config', () => {
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
        score: { correct: 4, incorrect: 2 },
      })

      const configBeforeReset = useGameStore.getState().config
      useGameStore.getState().reset()

      const state = useGameStore.getState()
      expect(state.phase).toBe('config')
      expect(state.sequence).toHaveLength(0)
      expect(state.currentIndex).toBe(0)
      expect(state.score).toEqual({ correct: 0, incorrect: 0 })
      expect(state.config).toEqual(configBeforeReset)
    })
  })
})
