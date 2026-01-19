import { create } from 'zustand'
import type { GameNote, SolfegeNote, MeasureCount, StringNoteConfig } from '../../types/music'
import type { InstrumentType } from '../../types/audio'
import { createNoteDefinition, getNotesForString } from '../../utils/notes'
import { useSettingsStore } from '../../store/settingsStore'
import type { LessonPhase, LessonScore } from '../common/types'

type ScaleType = 'major' | 'minor'

interface Lesson3Config {
  stringNotes: StringNoteConfig[]
  scaleType: ScaleType
  instrument: InstrumentType
}

interface Lesson3State {
  phase: LessonPhase
  config: Lesson3Config
  sequence: GameNote[]
  currentIndex: number
  score: LessonScore
}

const MAJOR_SCALE: SolfegeNote[] = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']
const MINOR_SCALE: SolfegeNote[] = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function pickRandomNote<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function getScaleNotes(scaleType: ScaleType, startNote: SolfegeNote): SolfegeNote[] {
  const scale = scaleType === 'major' ? MAJOR_SCALE : MINOR_SCALE
  const startIndex = scale.indexOf(startNote)
  if (startIndex === -1) return scale
  return [...scale.slice(startIndex), ...scale.slice(0, startIndex)]
}

function generateScaleSequence(stringNotes: StringNoteConfig[], scaleType: ScaleType): GameNote[] {
  const sequence: GameNote[] = []
  const fixedMeasures = 4
  const totalNotes = fixedMeasures * 4

  const availableStrings = stringNotes.filter((sn) => sn.notes.length > 0).map((sn) => sn.string)

  if (availableStrings.length === 0) return sequence

  const startString = pickRandomNote(availableStrings)
  const stringConfig = stringNotes.find((sc) => sc.string === startString)
  if (!stringConfig || stringConfig.notes.length === 0) return sequence

  const startNote = pickRandomNote(stringConfig.notes)
  const scaleNotes = getScaleNotes(scaleType, startNote)

  for (let i = 0; i < totalNotes; i++) {
    const scaleIndex = i % scaleNotes.length
    const solfege = scaleNotes[scaleIndex]
    const stringNotesList = getNotesForString(startString as 1 | 2 | 3 | 4 | 5 | 6)
    const noteDef = stringNotesList.find((n) => n.solfege === solfege)

    if (noteDef) {
      const note = createNoteDefinition(noteDef.solfege, noteDef.octave)
      sequence.push({
        id: generateId(),
        note,
        status: 'pending' as const,
      })
    }
  }

  if (sequence.length > 0) {
    sequence[0].status = 'active'
  }

  return sequence
}

function updateSequenceWithAnswer(
  sequence: GameNote[],
  currentIndex: number,
  isCorrect: boolean
): GameNote[] {
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

function activateNextNote(sequence: GameNote[], nextIndex: number): GameNote[] {
  const newSequence = [...sequence]
  newSequence[nextIndex] = {
    ...newSequence[nextIndex],
    status: 'active',
  }
  return newSequence
}

function processAnswer(state: Lesson3State, answer: SolfegeNote): Partial<Lesson3State> | null {
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

function loadConfigFromSettings(): Lesson3Config {
  try {
    const settings = useSettingsStore.getState()
    return {
      stringNotes: settings.stringNotes,
      scaleType: 'major',
      instrument: settings.instrument,
    }
  } catch {
    return {
      stringNotes: [],
      scaleType: 'major',
      instrument: 'guitar-classical',
    }
  }
}

interface Lesson3Store extends Lesson3State {
  setConfig: (config: Partial<Lesson3Config>) => void
  generateSequence: () => void
  submitAnswer: (note: SolfegeNote) => void
  reset: () => void
}

function createSetConfigHandler(set: (fn: (state: Lesson3State) => Partial<Lesson3State>) => void) {
  return (partialConfig: Partial<Lesson3Config>) => {
    set((state) => ({
      config: {
        ...state.config,
        ...partialConfig,
      },
    }))
  }
}

function createGenerateSequenceHandler(
  set: (fn: (state: Lesson3State) => Partial<Lesson3State>) => void
) {
  return () => {
    set((state) => {
      const sequence = generateScaleSequence(state.config.stringNotes, state.config.scaleType)
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
  set: (fn: (state: Lesson3State) => Partial<Lesson3State>) => void
) {
  return (answer: SolfegeNote) => {
    set((state) => {
      const result = processAnswer(state, answer)
      return result || state
    })
  }
}

function createResetHandler(set: (fn: (state: Lesson3State) => Partial<Lesson3State>) => void) {
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

function createLesson3Store(
  set: (fn: (state: Lesson3State) => Partial<Lesson3State>) => void
): Lesson3Store {
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

export const useLesson3Store = create<Lesson3Store>((set) => createLesson3Store(set))
