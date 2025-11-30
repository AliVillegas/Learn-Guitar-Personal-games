import type { SolfegeNote } from '../types/music'
import type { ReturnType } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'

type AudioHook = ReturnType<typeof useAudio>
type FeedbackHook = ReturnType<typeof useAnswerFeedback>

function handleIncorrectAnswer(
  selectedNote: SolfegeNote,
  currentNote: { note: { solfege: SolfegeNote } },
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useGameStore>
): void {
  feedback.setFeedback(selectedNote, 'incorrect')
  audio.playNote(currentNote.note).catch((error) => {
    console.error('Error playing note:', error)
  })
  audio.playErrorSound()
  game.submitAnswer(selectedNote)
}

function handleCorrectAnswer(
  selectedNote: SolfegeNote,
  currentNote: { note: { solfege: SolfegeNote; octave: number } },
  feedback: FeedbackHook,
  game: ReturnType<typeof useGameStore>
): void {
  feedback.setFeedback(selectedNote, 'correct')
  game.submitAnswer(selectedNote)
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

    const isCorrect = currentNote.note.solfege === selectedNote

    if (isCorrect) {
      handleCorrectAnswer(selectedNote, currentNote, feedback, game)
    } else {
      handleIncorrectAnswer(selectedNote, currentNote, audio, feedback, game)
    }
  }
}
