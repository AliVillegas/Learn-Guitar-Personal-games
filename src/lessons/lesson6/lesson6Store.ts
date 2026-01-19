import { create } from 'zustand'
import type {
  MultiVoiceGameNote,
  SolfegeNote,
  StringNoteConfig,
  VoiceNote,
} from '../../types/music'
import type { InstrumentType } from '../../types/audio'
import {
  createNoteDefinition,
  getNotesForString,
  getStaffPosition,
} from '../../utils/notes'
import { useSettingsStore } from '../../store/settingsStore'
import type { LessonPhase, LessonScore } from '../common/types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function pickRandomNote<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function getAvailableNotesForString(
  stringNotes: StringNoteConfig[],
  guitarString: number
): Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> {
  const stringConfig = stringNotes.find((sc) => sc.string === guitarString)
  if (!stringConfig) return []

  const stringNotesList = getNotesForString(guitarString as 1 | 2 | 3 | 4 | 5 | 6)
  return stringNotesList.filter((noteDef) => stringConfig.notes.includes(noteDef.solfege))
}

function pickRandomFromString(
  guitarString: number,
  stringNotes: StringNoteConfig[]
): { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null {
  const available = getAvailableNotesForString(stringNotes, guitarString)
  if (available.length === 0) return null
  return pickRandomNote(available)
}

function areNotesEqual(
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): boolean {
  return note1.solfege === note2.solfege && note1.octave === note2.octave
}

function areNotesSeconds(
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): boolean {
  const pos1 = getStaffPosition(note1.solfege, note1.octave)
  const pos2 = getStaffPosition(note2.solfege, note2.octave)
  return Math.abs(pos1 - pos2) === 1
}

function isValidStackedPair(
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  note2: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): boolean {
  return !areNotesEqual(note1, note2) && !areNotesSeconds(note1, note2)
}

function pickStackedMelodyNotes(
  melodyStrings: number[],
  stringNotes: StringNoteConfig[],
  note1: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null {
  const maxAttempts = 50
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const note2 = pickRandomFromString(pickRandomNote(melodyStrings), stringNotes)
    if (!note2) return null
    if (isValidStackedPair(note1, note2)) {
      return note2
    }
  }
  return null
}

function createBassVoice(bassNoteDef: { solfege: SolfegeNote; octave: 3 | 4 | 5 }): VoiceNote[] {
  const bassNote = createNoteDefinition(bassNoteDef.solfege, bassNoteDef.octave)
  return [{ note: bassNote, duration: 'h.' }]
}

function createMelodyVoiceWithChords(
  melodyNote1Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  melodyNote2Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): VoiceNote[] {
  const melodyNote1 = createNoteDefinition(melodyNote1Def.solfege, melodyNote1Def.octave)
  const melodyNote2 = createNoteDefinition(melodyNote2Def.solfege, melodyNote2Def.octave)

  return [
    { note: melodyNote1, duration: 'q' },
    { note: melodyNote2, duration: 'q' },
    { note: melodyNote1, duration: 'q' },
  ]
}

function createCheerfulMelodyVoice(
  melodyNote1Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  melodyNote2Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  melodyNote3Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): VoiceNote[] {
  const preferredOctave1 = melodyNote1Def.octave === 3 ? 4 : melodyNote1Def.octave
  const preferredOctave2 = melodyNote2Def.octave === 3 ? 4 : melodyNote2Def.octave
  const preferredOctave3 = melodyNote3Def.octave === 3 ? 4 : melodyNote3Def.octave

  const melodyNote1 = createNoteDefinition(melodyNote1Def.solfege, preferredOctave1)
  const melodyNote2 = createNoteDefinition(melodyNote2Def.solfege, preferredOctave2)
  const melodyNote3 = createNoteDefinition(melodyNote3Def.solfege, preferredOctave3)

  return [
    { note: melodyNote1, duration: 'q' },
    { note: melodyNote2, duration: 'q' },
    { note: melodyNote3, duration: 'q' },
  ]
}

function createComplexRhythmMelodyVoice(
  melodyNote1Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  melodyNote2Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  melodyNote3Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 }
): VoiceNote[] {
  const melodyNote1 = createNoteDefinition(melodyNote1Def.solfege, melodyNote1Def.octave)
  const melodyNote2 = createNoteDefinition(melodyNote2Def.solfege, melodyNote2Def.octave)
  const melodyNote3 = createNoteDefinition(melodyNote3Def.solfege, melodyNote3Def.octave)

  return [
    { note: melodyNote1, duration: 'q' },
    { note: melodyNote2, duration: 'q' },
    { note: melodyNote3, duration: 'q' },
  ]
}

function createFastMelodyVoice(
  allMelodyNotes: Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }>
): VoiceNote[] {
  const note1 = pickRandomNote(allMelodyNotes)
  const note2 = pickRandomNote(allMelodyNotes)
  const note3 = pickRandomNote(allMelodyNotes)

  return [
    { note: createNoteDefinition(note1.solfege, note1.octave), duration: 'q' },
    { note: createNoteDefinition(note2.solfege, note2.octave), duration: 'q' },
    { note: createNoteDefinition(note3.solfege, note3.octave), duration: 'q' },
  ]
}

function createSoloMelodyVoiceWithEighthNotes(
  allMelodyNotes: Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }>
): VoiceNote[] {
  const note1 = pickRandomNote(allMelodyNotes)
  const note2 = pickRandomNote(allMelodyNotes)
  const note3 = pickRandomNote(allMelodyNotes)
  const note4 = pickRandomNote(allMelodyNotes)
  const note5 = pickRandomNote(allMelodyNotes)
  const note6 = pickRandomNote(allMelodyNotes)

  return [
    { note: createNoteDefinition(note1.solfege, note1.octave), duration: 'e' },
    { note: createNoteDefinition(note2.solfege, note2.octave), duration: 'e' },
    { note: createNoteDefinition(note3.solfege, note3.octave), duration: 'e' },
    { note: createNoteDefinition(note4.solfege, note4.octave), duration: 'e' },
    { note: createNoteDefinition(note5.solfege, note5.octave), duration: 'e' },
    { note: createNoteDefinition(note6.solfege, note6.octave), duration: 'e' },
  ]
}

function generateConcertoSequence(stringNotes: StringNoteConfig[]): MultiVoiceGameNote[] {
  const sequence: MultiVoiceGameNote[] = []
  const fixedMeasures = 60

  const availableStrings = stringNotes
    .filter((sn) => sn.notes.length > 0)
    .map((sn) => sn.string)

  if (availableStrings.length === 0) return sequence

  const bassStrings: number[] = [4, 5, 6]
  const melodyStrings: number[] = [1, 2, 3]

  const allMelodyNotes: Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> = []
  melodyStrings.forEach((string) => {
    if (availableStrings.includes(string)) {
      const notes = getAvailableNotesForString(stringNotes, string)
      allMelodyNotes.push(...notes)
    }
  })

  const introProgressions: Array<{
    bass: SolfegeNote
    melody1: SolfegeNote
    melody2: SolfegeNote
    melody3?: SolfegeNote
    melody4?: SolfegeNote
    rhythmType?: 'standard' | 'cheerful' | 'complex' | 'fast'
  }> = [
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 're', melody1: 'fa', melody2: 'la', rhythmType: 'standard' },
    { bass: 're', melody1: 'fa', melody2: 'la', melody3: 'si', rhythmType: 'cheerful' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', rhythmType: 'standard' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', rhythmType: 'standard' },
    { bass: 'fa', melody1: 'la', melody2: 'do', rhythmType: 'standard' },
    { bass: 'fa', melody1: 'la', melody2: 'do', melody3: 're', melody4: 'mi', rhythmType: 'complex' },
    { bass: 'sol', melody1: 'si', melody2: 're', rhythmType: 'standard' },
    { bass: 'sol', melody1: 'si', melody2: 're', rhythmType: 'standard' },
  ]

  const developmentProgressions: Array<{
    bass: SolfegeNote
    melody1: SolfegeNote
    melody2: SolfegeNote
    melody3?: SolfegeNote
    melody4?: SolfegeNote
    rhythmType?: 'standard' | 'cheerful' | 'complex' | 'fast'
  }> = [
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 're', melody1: 'fa', melody2: 'la', rhythmType: 'standard' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', rhythmType: 'standard' },
    { bass: 'fa', melody1: 'la', melody2: 'do', melody3: 're', melody4: 'mi', rhythmType: 'complex' },
    { bass: 'sol', melody1: 'si', melody2: 're', rhythmType: 'standard' },
    { bass: 'la', melody1: 'do', melody2: 'mi', rhythmType: 'standard' },
    { bass: 'si', melody1: 're', melody2: 'fa', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', melody3: 'la', rhythmType: 'cheerful' },
    { bass: 're', melody1: 'fa', melody2: 'la', rhythmType: 'standard' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', rhythmType: 'standard' },
  ]

  const buildUpProgressions: Array<{
    bass: SolfegeNote
    melody1: SolfegeNote
    melody2: SolfegeNote
    melody3?: SolfegeNote
    melody4?: SolfegeNote
    rhythmType?: 'standard' | 'cheerful' | 'complex' | 'fast'
  }> = [
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 're', melody1: 'fa', melody2: 'la', rhythmType: 'standard' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', melody3: 'do', rhythmType: 'cheerful' },
    { bass: 'fa', melody1: 'la', melody2: 'do', rhythmType: 'standard' },
    { bass: 'sol', melody1: 'si', melody2: 're', rhythmType: 'standard' },
    { bass: 'la', melody1: 'do', melody2: 'mi', rhythmType: 'standard' },
    { bass: 'si', melody1: 're', melody2: 'fa', melody3: 'sol', melody4: 'la', rhythmType: 'complex' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 're', melody1: 'fa', melody2: 'la', rhythmType: 'standard' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', rhythmType: 'standard' },
  ]

  const resolutionProgressions: Array<{
    bass: SolfegeNote
    melody1: SolfegeNote
    melody2: SolfegeNote
    melody3?: SolfegeNote
    melody4?: SolfegeNote
    rhythmType?: 'standard' | 'cheerful' | 'complex' | 'fast'
  }> = [
    { bass: 'fa', melody1: 'la', melody2: 'do', rhythmType: 'standard' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', rhythmType: 'standard' },
    { bass: 're', melody1: 'fa', melody2: 'la', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', melody3: 'la', melody4: 'si', rhythmType: 'complex' },
    { bass: 'si', melody1: 're', melody2: 'fa', rhythmType: 'standard' },
    { bass: 'la', melody1: 'do', melody2: 'mi', rhythmType: 'standard' },
    { bass: 'sol', melody1: 'si', melody2: 're', rhythmType: 'standard' },
    { bass: 'fa', melody1: 'la', melody2: 'do', melody3: 're', rhythmType: 'cheerful' },
    { bass: 'mi', melody1: 'sol', melody2: 'si', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
  ]

  const outroProgressions: Array<{
    bass: SolfegeNote
    melody1: SolfegeNote
    melody2: SolfegeNote
    melody3?: SolfegeNote
    melody4?: SolfegeNote
    rhythmType?: 'standard' | 'cheerful' | 'complex' | 'fast'
  }> = [
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', melody3: 'la', melody4: 'si', rhythmType: 'complex' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', melody3: 'la', rhythmType: 'cheerful' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
    { bass: 'do', melody1: 'mi', melody2: 'sol', rhythmType: 'standard' },
  ]

  function getProgressionForMeasure(measureIndex: number): {
    bass: SolfegeNote
    melody1: SolfegeNote
    melody2: SolfegeNote
    melody3?: SolfegeNote
    melody4?: SolfegeNote
    rhythmType?: 'standard' | 'cheerful' | 'complex' | 'fast'
  } | null {
    if (measureIndex < 10) {
      return introProgressions[measureIndex]
    } else if (measureIndex < 20) {
      return developmentProgressions[measureIndex - 10]
    } else if (measureIndex < 30) {
      return buildUpProgressions[measureIndex - 20]
    } else if (measureIndex < 40) {
      return null
    } else if (measureIndex < 50) {
      return resolutionProgressions[measureIndex - 40]
    } else {
      return outroProgressions[measureIndex - 50]
    }
  }

  for (let measureIndex = 0; measureIndex < fixedMeasures; measureIndex++) {
    const isSoloSection = measureIndex >= 30 && measureIndex < 40

    if (isSoloSection) {
      if (allMelodyNotes.length === 0) continue

      const soloMelodyVoice = createSoloMelodyVoiceWithEighthNotes(allMelodyNotes)

      const availableBassStrings = bassStrings.filter((s) => availableStrings.includes(s))
      if (availableBassStrings.length === 0) continue

      const bassString = pickRandomNote(availableBassStrings)
      const bassNoteDef = pickRandomFromString(bassString, stringNotes)
      if (!bassNoteDef) continue

      const bassVoice = createBassVoice(bassNoteDef)

      sequence.push({
        id: generateId(),
        bassVoice,
        melodyVoice: soloMelodyVoice,
        status: measureIndex === 0 ? 'active' : 'pending',
        allowStacked: false,
      })
      continue
    }

    const progression = getProgressionForMeasure(measureIndex)
    if (!progression) continue

    const availableBassStrings = bassStrings.filter((s) => availableStrings.includes(s))
    if (availableBassStrings.length === 0) continue

    const bassString = pickRandomNote(availableBassStrings)
    const matchingBass = getAvailableNotesForString(stringNotes, bassString).find(
      (n) => n.solfege === progression.bass
    )

    let bassNoteDef: { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null = null
    if (matchingBass) {
      bassNoteDef = matchingBass
    } else {
      bassNoteDef = pickRandomFromString(bassString, stringNotes)
    }

    if (!bassNoteDef) continue

    const bassVoice = createBassVoice(bassNoteDef)

    const availableMelodyStrings = melodyStrings.filter(
      (s) => availableStrings.includes(s) && s < bassString
    )
    if (availableMelodyStrings.length === 0) continue

    const measureMelodyNotes: Array<{ solfege: SolfegeNote; octave: 3 | 4 | 5 }> = []
    availableMelodyStrings.forEach((string) => {
      const notes = getAvailableNotesForString(stringNotes, string)
      measureMelodyNotes.push(...notes)
    })

    let melodyNote1Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null = null
    let melodyNote2Def: { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null = null

    const rhythmType = progression.rhythmType || 'standard'

    if (rhythmType === 'fast') {
      const fastMelodyVoice = createFastMelodyVoice(measureMelodyNotes)
      sequence.push({
        id: generateId(),
        bassVoice,
        melodyVoice: fastMelodyVoice,
        status: measureIndex === 0 ? 'active' : 'pending',
        allowStacked: false,
      })
      continue
    }

    const note1Candidates = measureMelodyNotes.filter((n) => n.solfege === progression.melody1)
    const note2Candidates = measureMelodyNotes.filter((n) => n.solfege === progression.melody2)

    for (const note1 of note1Candidates) {
      for (const note2 of note2Candidates) {
        if (isValidStackedPair(note1, note2)) {
          melodyNote1Def = note1
          melodyNote2Def = note2
          break
        }
      }
      if (melodyNote1Def && melodyNote2Def) break
    }

    if (!melodyNote1Def || !melodyNote2Def) {
      if (measureMelodyNotes.length === 0) continue
      melodyNote1Def = pickRandomNote(measureMelodyNotes)
      melodyNote2Def = measureMelodyNotes.find(
        (n) => n !== melodyNote1Def && isValidStackedPair(melodyNote1Def!, n)
      )
      if (!melodyNote2Def) {
        melodyNote2Def = pickStackedMelodyNotes(availableMelodyStrings, stringNotes, melodyNote1Def)
      }
      if (!melodyNote2Def) continue
    }

    let melodyVoice: VoiceNote[]

    if (rhythmType === 'cheerful' && progression.melody3) {
      const note3Candidates = measureMelodyNotes.filter((n) => n.solfege === progression.melody3)
      const preferredNote3 = note3Candidates.find((n) => n.octave >= 4) || note3Candidates[0]
      const melodyNote3Def = preferredNote3 || pickRandomNote(measureMelodyNotes.filter((n) => n.octave >= 4)) || pickRandomNote(measureMelodyNotes)
      melodyVoice = createCheerfulMelodyVoice(melodyNote1Def, melodyNote2Def, melodyNote3Def)
    } else if (rhythmType === 'complex' && progression.melody3) {
      const note3Candidates = measureMelodyNotes.filter((n) => n.solfege === progression.melody3)
      const melodyNote3Def = note3Candidates[0] || pickRandomNote(measureMelodyNotes)
      melodyVoice = createComplexRhythmMelodyVoice(
        melodyNote1Def,
        melodyNote2Def,
        melodyNote3Def
      )
    } else {
      melodyVoice = createMelodyVoiceWithChords(melodyNote1Def, melodyNote2Def)
    }

    sequence.push({
      id: generateId(),
      bassVoice,
      melodyVoice,
      status: measureIndex === 0 ? 'active' : 'pending',
      allowStacked: rhythmType === 'complex' || rhythmType === 'fast',
    })
  }

  return sequence
}

function updateSequenceWithAnswer(
  sequence: MultiVoiceGameNote[],
  currentIndex: number,
  isCorrect: boolean
): MultiVoiceGameNote[] {
  const newSequence = [...sequence]
  newSequence[currentIndex] = {
    ...newSequence[currentIndex],
    status: isCorrect ? 'correct' : 'incorrect',
  }
  return newSequence
}

function calculateNewScore(currentScore: LessonScore, isCorrect: boolean): LessonScore {
  return {
    correct: isCorrect ? currentScore.correct + 1 : currentScore.correct,
    incorrect: isCorrect ? currentScore.incorrect : currentScore.incorrect + 1,
  }
}

function activateNextNote(sequence: MultiVoiceGameNote[], nextIndex: number): MultiVoiceGameNote[] {
  const newSequence = [...sequence]
  newSequence[nextIndex] = {
    ...newSequence[nextIndex],
    status: 'active',
  }
  return newSequence
}

interface Lesson6Config {
  stringNotes: StringNoteConfig[]
  instrument: InstrumentType
}

interface Lesson6State {
  phase: LessonPhase
  config: Lesson6Config
  sequence: MultiVoiceGameNote[]
  currentIndex: number
  score: LessonScore
}

function processAnswer(state: Lesson6State, answer: SolfegeNote): Partial<Lesson6State> | null {
  if (state.phase !== 'playing') return null

  const currentNote = state.sequence[state.currentIndex]
  if (!currentNote) return null

  const isCorrect = currentNote.note.solfege === answer
  const newSequence = updateSequenceWithAnswer(state.sequence, state.currentIndex, isCorrect)
  const newScore = calculateNewScore(state.score, isCorrect)

  if (!isCorrect) {
    return {
      sequence: newSequence,
      score: newScore,
    }
  }

  const nextIndex = state.currentIndex + 1
  const isComplete = nextIndex >= state.sequence.length

  if (isComplete) {
    return {
      phase: 'complete' as const,
      sequence: newSequence,
      score: newScore,
    }
  }

  return {
    sequence: activateNextNote(newSequence, nextIndex),
    currentIndex: nextIndex,
    score: newScore,
  }
}

function loadConfigFromSettings(): Lesson6Config {
  try {
    const settings = useSettingsStore.getState()
    return {
      stringNotes: settings.stringNotes,
      instrument: settings.instrument,
    }
  } catch {
    return {
      stringNotes: [],
      instrument: 'guitar-classical',
    }
  }
}

interface Lesson6Store extends Lesson6State {
  setConfig: (config: Partial<Lesson6Config>) => void
  generateSequence: () => void
  submitAnswer: (note: SolfegeNote) => void
  reset: () => void
}

function createSetConfigHandler(set: (fn: (state: Lesson6State) => Partial<Lesson6State>) => void) {
  return (partialConfig: Partial<Lesson6Config>) => {
    set((state) => ({
      config: {
        ...state.config,
        ...partialConfig,
      },
    }))
  }
}

function createGenerateSequenceHandler(
  set: (fn: (state: Lesson6State) => Partial<Lesson6State>) => void
) {
  return () => {
    set((state) => {
      const sequence = generateConcertoSequence(state.config.stringNotes)
      return {
        phase: 'playing' as const,
        sequence,
        currentIndex: 0,
        score: { correct: 0, incorrect: 0 },
      }
    })
  }
}

function createSubmitAnswerHandler(
  set: (fn: (state: Lesson6State) => Partial<Lesson6State>) => void
) {
  return (answer: SolfegeNote) => {
    set((state) => {
      const result = processAnswer(state, answer)
      return result || state
    })
  }
}

function createResetHandler(set: (fn: (state: Lesson6State) => Partial<Lesson6State>) => void) {
  return () => {
    set((state) => ({
      phase: 'config' as const,
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
      config: state.config,
    }))
  }
}

function createLesson6Store(
  set: (fn: (state: Lesson6State) => Partial<Lesson6State>) => void
): Lesson6Store {
  return {
    phase: 'config',
    config: loadConfigFromSettings(),
    sequence: [],
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },
    setConfig: createSetConfigHandler(set),
    generateSequence: createGenerateSequenceHandler(set),
    submitAnswer: createSubmitAnswerHandler(set),
    reset: createResetHandler(set),
  }
}

export const useLesson6Store = create<Lesson6Store>((set) => createLesson6Store(set))
