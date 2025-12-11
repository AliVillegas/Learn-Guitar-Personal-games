import { describe, it, expect, beforeEach } from 'vitest'
import { useLesson2Store } from './lesson2Store'
import { createNoteDefinition } from '../../utils/notes'
import type { MultiVoiceGameNote } from '../../types/music'

function createTestMultiVoiceNote() {
  return {
    id: '1',
    bassVoice: [{ note: createNoteDefinition('mi', 3), duration: 'h.' as const }],
    melodyVoice: [
      { note: null, duration: 'qr' as const },
      { note: createNoteDefinition('sol', 4), duration: 'q' as const },
      { note: createNoteDefinition('la', 4), duration: 'q' as const },
    ],
    status: 'active' as const,
  }
}

describe('useLesson2Store', () => {
  beforeEach(() => {
    useLesson2Store.setState({
      phase: 'config',
      config: {
        measureCount: 4,
        noteMode: 'single',
      },
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
  })

  describe('setConfig', () => {
    it('updates config with partial values', () => {
      useLesson2Store.getState().setConfig({ measureCount: 5 })

      expect(useLesson2Store.getState().config.measureCount).toBe(5)
      expect(useLesson2Store.getState().config.noteMode).toBe('single')
    })

    it('updates noteMode', () => {
      useLesson2Store.getState().setConfig({ noteMode: 'stacked' })

      expect(useLesson2Store.getState().config.noteMode).toBe('stacked')
    })

    it('updates noteMode to mixed', () => {
      useLesson2Store.getState().setConfig({ noteMode: 'mixed' })

      expect(useLesson2Store.getState().config.noteMode).toBe('mixed')
    })
  })

  describe('generateSequence', () => {
    beforeEach(() => {
      useLesson2Store.setState({
        config: {
          measureCount: 4,
          noteMode: 'single',
        },
      })
    })

    it('creates sequence with correct number of measures', () => {
      useLesson2Store.getState().generateSequence()

      const state = useLesson2Store.getState()
      expect(state.sequence.length).toBeGreaterThan(0)
      expect(state.phase).toBe('playing')
      expect(state.currentIndex).toBe(0)
      expect(state.score).toEqual({ correct: 0, incorrect: 0 })
    })

    it('sets first measure as active', () => {
      useLesson2Store.getState().generateSequence()

      const state = useLesson2Store.getState()
      if (state.sequence.length > 0) {
        expect(state.sequence[0].status).toBe('active')
      }
    })

    it('generates single note mode correctly', () => {
      useLesson2Store.setState({
        config: {
          measureCount: 4,
          noteMode: 'single',
        },
      })

      useLesson2Store.getState().generateSequence()

      const state = useLesson2Store.getState()
      state.sequence.forEach(checkSingleNoteMeasure)
    })

    it('generates stacked note mode correctly', () => {
      useLesson2Store.setState({
        config: {
          measureCount: 4,
          noteMode: 'stacked',
        },
      })

      useLesson2Store.getState().generateSequence()

      const state = useLesson2Store.getState()
      state.sequence.forEach(checkStackedNoteMeasure)
    })

    it('generates mixed mode with varying patterns', () => {
      useLesson2Store.setState({
        config: {
          measureCount: 8,
          noteMode: 'mixed',
        },
      })

      useLesson2Store.getState().generateSequence()

      const state = useLesson2Store.getState()
      const stackedCount = state.sequence.filter((measure) => measure.allowStacked === true).length
      const singleCount = state.sequence.filter((measure) => measure.allowStacked === false).length

      expect(stackedCount + singleCount).toBe(state.sequence.length)
      expect(stackedCount).toBeGreaterThan(0)
      expect(singleCount).toBeGreaterThan(0)
    })
  })

  describe('submitAnswer', () => {
    beforeEach(() => {
      useLesson2Store.setState({
        phase: 'playing',
        sequence: [
          createTestMultiVoiceNote(),
          {
            id: '2',
            bassVoice: [{ note: createNoteDefinition('re', 4), duration: 'h.' as const }],
            melodyVoice: [
              { note: null, duration: 'qr' as const },
              { note: createNoteDefinition('fa', 4), duration: 'q' as const },
              { note: createNoteDefinition('sol', 4), duration: 'q' as const },
            ],
            status: 'pending' as const,
          },
        ],
        currentIndex: 0,
        score: { correct: 0, incorrect: 0 },
      })
    })

    it('marks measure correct and advances index on correct melody answer', () => {
      useLesson2Store.getState().submitAnswer('sol')

      const state = useLesson2Store.getState()
      expect(state.sequence[0].status).toBe('correct')
      expect(state.currentIndex).toBe(1)
      expect(state.sequence[1].status).toBe('active')
      expect(state.score.correct).toBe(1)
      expect(state.score.incorrect).toBe(0)
    })

    it('marks measure incorrect but does not advance on wrong answer', () => {
      useLesson2Store.getState().submitAnswer('do')

      const state = useLesson2Store.getState()
      expect(state.sequence[0].status).toBe('incorrect')
      expect(state.currentIndex).toBe(0)
      expect(state.score.correct).toBe(0)
      expect(state.score.incorrect).toBe(1)
    })

    it('accepts any melody note as correct answer', () => {
      const testNote = createTestMultiVoiceNote()
      useLesson2Store.setState({
        sequence: [testNote],
        currentIndex: 0,
      })

      useLesson2Store.getState().submitAnswer('la')

      const state = useLesson2Store.getState()
      expect(state.sequence[0].status).toBe('correct')
      expect(state.phase).toBe('complete')
    })

    it('does nothing when phase is not playing', () => {
      useLesson2Store.setState({ phase: 'config' })
      const initialState = useLesson2Store.getState()

      useLesson2Store.getState().submitAnswer('sol')

      const state = useLesson2Store.getState()
      expect(state).toEqual(initialState)
    })

    it('does nothing when current note is undefined', () => {
      useLesson2Store.setState({ currentIndex: 10 })
      const initialState = useLesson2Store.getState()

      useLesson2Store.getState().submitAnswer('sol')

      const state = useLesson2Store.getState()
      expect(state).toEqual(initialState)
    })
  })

  describe('reset', () => {
    it('resets to config phase while keeping config', () => {
      useLesson2Store.setState({
        phase: 'complete',
        sequence: [createTestMultiVoiceNote()],
        currentIndex: 1,
        score: { correct: 4, incorrect: 2 },
      })

      const configBeforeReset = useLesson2Store.getState().config
      useLesson2Store.getState().reset()

      const state = useLesson2Store.getState()
      expect(state.phase).toBe('config')
      expect(state.sequence).toHaveLength(0)
      expect(state.currentIndex).toBe(0)
      expect(state.score).toEqual({ correct: 0, incorrect: 0 })
      expect(state.config).toEqual(configBeforeReset)
    })
  })
})

function checkNoSecondsInMeasure(measure: MultiVoiceGameNote): void {
  const filteredNotes = measure.melodyVoice.filter((vn) => vn.note !== null)
  const melodyNotes = filteredNotes.map((vn) => {
    if (vn.note === null) throw new Error('Note should not be null after filter')
    return vn.note
  })
  if (melodyNotes.length >= 2) {
    const note1 = melodyNotes[0]
    const note2 = melodyNotes[1]
    const pos1 = note1.staffPosition
    const pos2 = note2.staffPosition
    expect(Math.abs(pos1 - pos2)).not.toBe(1)
  }
}

function checkSingleNoteMeasure(measure: MultiVoiceGameNote): void {
  const melodyNotes = measure.melodyVoice.filter((vn) => vn.note !== null)
  expect(melodyNotes.length).toBeLessThanOrEqual(2)
}

function checkStackedNoteMeasure(measure: MultiVoiceGameNote): void {
  checkNoSecondsInMeasure(measure)
  const melodyNotes = measure.melodyVoice.filter((vn) => vn.note !== null)
  expect(melodyNotes.length).toBeGreaterThanOrEqual(2)
}
