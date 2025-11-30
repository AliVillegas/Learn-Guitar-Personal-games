import type { SolfegeNote } from '../types/music'
import type { ReturnType } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'

type AudioHook = ReturnType<typeof useAudio>
type FeedbackHook = ReturnType<typeof useAnswerFeedback>

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
      feedback.setFeedback(selectedNote, 'correct')
    } else {
      feedback.setFeedback(selectedNote, 'incorrect')
      audio.playNote(currentNote.note).catch((error) => {
        console.error('Error playing note:', error)
      })
      audio.playErrorSound()
    }

    game.submitAnswer(selectedNote)
  }
}
