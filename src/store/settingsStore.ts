import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameConfig, StringNoteConfig } from '../types/game'
import type { InstrumentType } from '../types/audio'
import type { LessonType, MeasureCount } from '../types/music'
import { getAllGuitarStrings, getNotesForString } from '../utils/notes'

export type MetronomeSubdivision = 1 | 2 | 4

function createDefaultStringNotes(): StringNoteConfig[] {
  return getAllGuitarStrings().map((string) => ({
    string,
    notes: getNotesForString(string).map((n) => n.solfege),
  }))
}

const defaultSettings: Omit<GameConfig, 'selectedNotes'> & {
  playbackBpm: number
  metronomeEnabled: boolean
  metronomeSubdivision: MetronomeSubdivision
  selectedLesson: LessonType
} = {
  stringNotes: createDefaultStringNotes(),
  measureCount: 1,
  instrument: 'guitar-classical',
  lessonType: 'single-notes',
  playbackBpm: 120,
  metronomeEnabled: false,
  metronomeSubdivision: 1,
  selectedLesson: 'single-notes',
}

interface SettingsStore {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
  playbackBpm: number
  metronomeEnabled: boolean
  metronomeSubdivision: MetronomeSubdivision
  selectedLesson: LessonType
  setStringNotes: (stringNotes: StringNoteConfig[]) => void
  setMeasureCount: (measureCount: MeasureCount) => void
  setInstrument: (instrument: InstrumentType) => void
  setPlaybackBpm: (bpm: number) => void
  setMetronomeEnabled: (enabled: boolean) => void
  setMetronomeSubdivision: (subdivision: MetronomeSubdivision) => void
  setSelectedLesson: (lesson: LessonType) => void
  reset: () => void
}

function createSettingsStore(set: (partial: Partial<SettingsStore>) => void): SettingsStore {
  return {
    stringNotes: defaultSettings.stringNotes,
    measureCount: defaultSettings.measureCount,
    instrument: defaultSettings.instrument,
    playbackBpm: defaultSettings.playbackBpm,
    metronomeEnabled: defaultSettings.metronomeEnabled,
    metronomeSubdivision: defaultSettings.metronomeSubdivision,
    selectedLesson: defaultSettings.selectedLesson,

    setStringNotes: (stringNotes) => set({ stringNotes }),

    setMeasureCount: (measureCount) => set({ measureCount }),

    setInstrument: (instrument) => set({ instrument }),

    setPlaybackBpm: (playbackBpm) => set({ playbackBpm }),

    setMetronomeEnabled: (metronomeEnabled) => set({ metronomeEnabled }),

    setMetronomeSubdivision: (metronomeSubdivision) => set({ metronomeSubdivision }),

    setSelectedLesson: (selectedLesson) => set({ selectedLesson }),

    reset: () => set(defaultSettings),
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(createSettingsStore, {
    name: 'guitar-sight-reading-settings',
  })
)
