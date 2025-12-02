import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameConfig, StringNoteConfig } from '../types/game'
import type { InstrumentType } from '../types/audio'
import type { MeasureCount } from '../types/music'
import { getAllGuitarStrings, getNotesForString } from '../utils/notes'

export type MetronomeSubdivision = 1 | 2 | 4

function createDefaultStringNotes(): StringNoteConfig[] {
  return getAllGuitarStrings().map((string) => ({
    string,
    notes: getNotesForString(string).map((n) => n.solfege),
  }))
}

const defaultSettings: Omit<GameConfig, 'selectedNotes'> & {
  autoPlayOnGenerate: boolean
  playbackBpm: number
  metronomeEnabled: boolean
  metronomeSubdivision: MetronomeSubdivision
} = {
  stringNotes: createDefaultStringNotes(),
  measureCount: 1,
  instrument: 'guitar-classical',
  autoPlayOnGenerate: true,
  playbackBpm: 120,
  metronomeEnabled: false,
  metronomeSubdivision: 1,
}

interface SettingsStore {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
  autoPlayOnGenerate: boolean
  playbackBpm: number
  metronomeEnabled: boolean
  metronomeSubdivision: MetronomeSubdivision
  setStringNotes: (stringNotes: StringNoteConfig[]) => void
  setMeasureCount: (measureCount: MeasureCount) => void
  setInstrument: (instrument: InstrumentType) => void
  setAutoPlayOnGenerate: (autoPlay: boolean) => void
  setPlaybackBpm: (bpm: number) => void
  setMetronomeEnabled: (enabled: boolean) => void
  setMetronomeSubdivision: (subdivision: MetronomeSubdivision) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      stringNotes: defaultSettings.stringNotes,
      measureCount: defaultSettings.measureCount,
      instrument: defaultSettings.instrument,
      autoPlayOnGenerate: defaultSettings.autoPlayOnGenerate,
      playbackBpm: defaultSettings.playbackBpm,
      metronomeEnabled: defaultSettings.metronomeEnabled,
      metronomeSubdivision: defaultSettings.metronomeSubdivision,

      setStringNotes: (stringNotes) => set({ stringNotes }),

      setMeasureCount: (measureCount) => set({ measureCount }),

      setInstrument: (instrument) => set({ instrument }),

      setAutoPlayOnGenerate: (autoPlayOnGenerate) => set({ autoPlayOnGenerate }),

      setPlaybackBpm: (playbackBpm) => set({ playbackBpm }),

      setMetronomeEnabled: (metronomeEnabled) => set({ metronomeEnabled }),

      setMetronomeSubdivision: (metronomeSubdivision) => set({ metronomeSubdivision }),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'guitar-sight-reading-settings',
    }
  )
)
