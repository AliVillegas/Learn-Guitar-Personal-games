import { describe, it, expect } from 'vitest'
import { gameReducer } from './useGameReducer'
import type { GameState } from '../types/game'
import { createNoteDefinition } from '../utils/notes'

function createTestState(overrides: Partial<GameState>): GameState {
  return {
    phase: 'playing',
    config: {
      selectedNotes: ['mi', 'fa'],
      measureCount: 1,
    },
    sequence: [],
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },
    ...overrides,
  }
}

describe('gameReducer', () => {
  describe('SET_CONFIG', () => {
    it('updates config with partial values', () => {
      const state = createTestState({})
      const result = gameReducer(state, {
        type: 'SET_CONFIG',
        payload: { measureCount: 2 },
      })

      expect(result.config.measureCount).toBe(2)
      expect(result.config.selectedNotes).toEqual(['mi', 'fa'])
    })
  })

  describe('GENERATE_SEQUENCE', () => {
    it('creates sequence with correct number of notes', () => {
      const state = createTestState({ config: { selectedNotes: ['mi'], measureCount: 1 } })
      const result = gameReducer(state, { type: 'GENERATE_SEQUENCE' })

      expect(result.sequence).toHaveLength(4)
      expect(result.phase).toBe('playing')
      expect(result.sequence[0].status).toBe('active')
    })
  })

  describe('SUBMIT_ANSWER', () => {
    it('marks note correct and advances index on correct answer', () => {
      const miNote = {
        id: '1',
        note: createNoteDefinition('mi', 3),
        status: 'active' as const,
      }
      const faNote = {
        id: '2',
        note: createNoteDefinition('fa', 3),
        status: 'pending' as const,
      }
      const state = createTestState({
        currentIndex: 0,
        sequence: [miNote, faNote],
      })
      const result = gameReducer(state, { type: 'SUBMIT_ANSWER', payload: 'mi' })

      expect(result.sequence[0].status).toBe('correct')
      expect(result.currentIndex).toBe(1)
      expect(result.sequence[1].status).toBe('active')
      expect(result.score.correct).toBe(1)
    })

    it('marks note incorrect but does not advance on wrong answer', () => {
      const miNote = {
        id: '1',
        note: createNoteDefinition('mi', 3),
        status: 'active' as const,
      }
      const state = createTestState({
        currentIndex: 0,
        sequence: [miNote],
      })
      const result = gameReducer(state, { type: 'SUBMIT_ANSWER', payload: 'fa' })

      expect(result.sequence[0].status).toBe('incorrect')
      expect(result.currentIndex).toBe(0)
      expect(result.score.incorrect).toBe(1)
    })

    it('transitions to complete when all notes answered correctly', () => {
      const miNote = {
        id: '1',
        note: createNoteDefinition('mi', 3),
        status: 'active' as const,
      }
      const state = createTestState({
        currentIndex: 0,
        sequence: [miNote],
      })
      const result = gameReducer(state, { type: 'SUBMIT_ANSWER', payload: 'mi' })

      expect(result.phase).toBe('complete')
    })
  })

  describe('RESET', () => {
    it('resets to config phase while keeping config', () => {
      const state = createTestState({
        phase: 'complete',
        sequence: [{ id: '1', note: createNoteDefinition('mi', 3), status: 'correct' }],
      })
      const result = gameReducer(state, { type: 'RESET' })

      expect(result.phase).toBe('config')
      expect(result.sequence).toHaveLength(0)
      expect(result.config).toEqual(state.config)
    })
  })
})

