import type { SolfegeNote, GameNote, MultiVoiceGameNote } from '../types/music'
import type { ReturnType } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'

type AudioHook = ReturnType<typeof useAudio>
type FeedbackHook = ReturnType<typeof useAnswerFeedback>

function isMultiVoiceNote(note: GameNote | MultiVoiceGameNote): note is MultiVoiceGameNote {
  return 'bassVoice' in note && 'melodyVoice' in note
}

function getNoteToPlay(
  currentNote: GameNote | MultiVoiceGameNote
): { solfege: SolfegeNote; octave: 3 | 4 | 5 } | null {
  if (isMultiVoiceNote(currentNote)) {
    const melodyNotes = currentNote.melodyVoice.filter((vn) => vn.note !== null)
    if (melodyNotes.length > 0 && melodyNotes[0].note) {
      return melodyNotes[0].note
    }
    return null
  }
  return currentNote.note
}

function handleIncorrectAnswer(
  selectedNote: SolfegeNote,
  currentNote: GameNote | MultiVoiceGameNote,
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useGameStore>
): void {
  feedback.setFeedback(selectedNote, 'incorrect')
  const noteToPlay = getNoteToPlay(currentNote)
  if (noteToPlay) {
    audio.playNote(noteToPlay).catch((error) => {
      console.error('Error playing note:', error)
    })
  }
  audio.playErrorSound()
  game.submitAnswer(selectedNote)
}

function handleCorrectAnswer(
  selectedNote: SolfegeNote,
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useGameStore>
): void {
  feedback.setFeedback(selectedNote, 'correct')
  audio.playSuccessSound()
  game.submitAnswer(selectedNote)
}

function checkAnswer(
  currentNote: GameNote | MultiVoiceGameNote,
  selectedNote: SolfegeNote
): boolean {
  if (isMultiVoiceNote(currentNote)) {
    const melodyNotes = currentNote.melodyVoice
      .filter((vn) => vn.note !== null)
      .map((vn) => {
        if (vn.note === null) return null
        return vn.note.solfege
      })
      .filter((solfege): solfege is SolfegeNote => solfege !== null)
    return melodyNotes.includes(selectedNote)
  }
  return currentNote.note.solfege === selectedNote
}

export function createAnswerHandler(
  game: ReturnType<typeof useGameStore>,
  audio: AudioHook,
  feedback: FeedbackHook
) {
  return (selectedNote: SolfegeNote) => {
    const currentNote = game.sequence[game.currentIndex]
    if (!currentNote || game.phase !== 'playing') {
      return
    }

    const isCorrect = checkAnswer(currentNote, selectedNote)

    if (isCorrect) {
      handleCorrectAnswer(selectedNote, audio, feedback, game)
    } else {
      handleIncorrectAnswer(selectedNote, currentNote, audio, feedback, game)
    }
  }
}
