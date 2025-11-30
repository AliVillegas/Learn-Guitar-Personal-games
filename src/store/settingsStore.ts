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

const defaultSettings: Omit<GameConfig, 'selectedNotes'> = {
  stringNotes: createDefaultStringNotes(),
  measureCount: 1,
  instrument: 'guitar-classical',
}

interface SettingsStore {
  stringNotes: StringNoteConfig[]
  measureCount: MeasureCount
  instrument: InstrumentType
  setStringNotes: (stringNotes: StringNoteConfig[]) => void
  setMeasureCount: (measureCount: MeasureCount) => void
  setInstrument: (instrument: InstrumentType) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      stringNotes: defaultSettings.stringNotes,
      measureCount: defaultSettings.measureCount,
      instrument: defaultSettings.instrument,

      setStringNotes: (stringNotes) => set({ stringNotes }),

      setMeasureCount: (measureCount) => set({ measureCount }),

      setInstrument: (instrument) => set({ instrument }),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'guitar-sight-reading-settings',
    }
  )
)
