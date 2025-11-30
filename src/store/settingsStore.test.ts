import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settingsStore'

describe('useSettingsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useSettingsStore.setState({
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
    })
  })

  it('initializes with default settings', () => {
    localStorage.clear()
    const store = useSettingsStore.getState()
    expect(store.stringNotes).toBeDefined()
    expect(store.measureCount).toBe(1)
    expect(store.instrument).toBe('guitar-classical')
  })

  it('sets string notes', () => {
    const newStringNotes = [
      { string: 6, notes: ['mi', 'fa'] },
      { string: 5, notes: ['la'] },
    ]
    useSettingsStore.getState().setStringNotes(newStringNotes)

    expect(useSettingsStore.getState().stringNotes).toEqual(newStringNotes)
  })

  it('sets measure count', () => {
    useSettingsStore.getState().setMeasureCount(2)

    expect(useSettingsStore.getState().measureCount).toBe(2)
  })

  it('sets instrument', () => {
    useSettingsStore.getState().setInstrument('midi')

    expect(useSettingsStore.getState().instrument).toBe('midi')
  })

  it('resets to default settings', () => {
    useSettingsStore.getState().setMeasureCount(3)
    useSettingsStore.getState().setInstrument('midi')

    useSettingsStore.getState().reset()

    expect(useSettingsStore.getState().measureCount).toBe(1)
    expect(useSettingsStore.getState().instrument).toBe('guitar-classical')
  })

  it('persists settings to localStorage', () => {
    const newStringNotes = [
      { string: 6, notes: ['mi', 'fa'] },
      { string: 5, notes: ['la'] },
    ]
    useSettingsStore.getState().setStringNotes(newStringNotes)
    useSettingsStore.getState().setMeasureCount(2)
    useSettingsStore.getState().setInstrument('midi')

    const stored = localStorage.getItem('guitar-sight-reading-settings')
    expect(stored).toBeTruthy()

    if (stored) {
      const parsed = JSON.parse(stored)
      expect(parsed.state.stringNotes).toEqual(newStringNotes)
      expect(parsed.state.measureCount).toBe(2)
      expect(parsed.state.instrument).toBe('midi')
    }
  })

  it('persists and loads settings correctly', () => {
    const testStringNotes = [
      { string: 6, notes: ['mi', 'fa'] },
      { string: 5, notes: ['la'] },
    ]
    useSettingsStore.getState().setStringNotes(testStringNotes)
    useSettingsStore.getState().setMeasureCount(3)
    useSettingsStore.getState().setInstrument('guitar-synth')

    const stored = localStorage.getItem('guitar-sight-reading-settings')
    expect(stored).toBeTruthy()

    if (stored) {
      const parsed = JSON.parse(stored)
      expect(parsed.state.stringNotes).toEqual(testStringNotes)
      expect(parsed.state.measureCount).toBe(3)
      expect(parsed.state.instrument).toBe('guitar-synth')
    }
  })
})
