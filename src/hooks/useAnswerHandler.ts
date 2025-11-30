import type { SolfegeNote } from '../types/music'
import type { ReturnType } from 'react'
import { useGameState } from './useGameState'
import { useAudio } from './useAudio'
import { useAnswerFeedback } from './useAnswerFeedback'

type GameStateHook = ReturnType<typeof useGameState>
type AudioHook = ReturnType<typeof useAudio>
type FeedbackHook = ReturnType<typeof useAnswerFeedback>

export function createAnswerHandler(
  game: GameStateHook,
  audio: AudioHook,
  feedback: FeedbackHook
) {
  return (selectedNote: SolfegeNote) => {
    const currentNote = game.state.sequence[game.state.currentIndex]
    if (!currentNote || game.state.phase !== 'playing') {
      return
    }

    audio.playNote(currentNote.note)
    const isCorrect = currentNote.note.solfege === selectedNote

    if (isCorrect) {
      feedback.setFeedback(selectedNote, 'correct')
    } else {
      feedback.setFeedback(selectedNote, 'incorrect')
      audio.playErrorSound()
    }

    game.submitAnswer(selectedNote)
  }
}

