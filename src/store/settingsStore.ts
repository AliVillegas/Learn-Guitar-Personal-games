import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameConfig, StringNoteConfig } from '../types/game'
import type { InstrumentType } from '../types/audio'
import type { MeasureCount } from '../types/music'
import { getAllGuitarStrings, getNotesForString } from '../utils/notes'

function createDefaultStringNotes(): StringNoteConfig[] {
  return getAllGuitarStrings().map((string) => ({
    string,
    notes: getNotesForString(string).map((n) => n.solfege),
  }))
}

const defaultSettings: Omit<GameConfig, 'selectedNotes'> & {
  autoPlayOnGenerate: boolean
  playbackBpm: number
} = {
  stringNotes: createDefaultStringNotes(),
  measureCount: 1,
  instrument: 'guitar-classical',
  autoPlayOnGenerate: true,
  playbackBpm: 120,
}

interface SettingsStore {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
  autoPlayOnGenerate: boolean
  playbackBpm: number
  setStringNotes: (stringNotes: StringNoteConfig[]) => void
  setMeasureCount: (measureCount: MeasureCount) => void
  setInstrument: (instrument: InstrumentType) => void
  setAutoPlayOnGenerate: (autoPlay: boolean) => void
  setPlaybackBpm: (bpm: number) => void
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

      setStringNotes: (stringNotes) => set({ stringNotes }),

      setMeasureCount: (measureCount) => set({ measureCount }),

      setInstrument: (instrument) => set({ instrument }),

      setAutoPlayOnGenerate: (autoPlayOnGenerate) => set({ autoPlayOnGenerate }),

      setPlaybackBpm: (playbackBpm) => set({ playbackBpm }),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'guitar-sight-reading-settings',
    }
  )
)
