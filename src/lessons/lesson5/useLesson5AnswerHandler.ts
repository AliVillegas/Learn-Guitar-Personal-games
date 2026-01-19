import type { SolfegeNote, GameNote } from '../../types/music'
import { useLesson5Store } from './lesson5Store'
import { useLesson5Audio } from './useLesson5Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'

type AudioHook = ReturnType<typeof useLesson5Audio>
type FeedbackHook = ReturnType<typeof useAnswerFeedback>

function handleIncorrectAnswer(
  selectedNote: SolfegeNote,
  currentNote: GameNote,
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useLesson5Store>
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
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useLesson5Store>
): void {
  feedback.setFeedback(selectedNote, 'correct')
  audio.playSuccessSound()
  game.submitAnswer(selectedNote)
}

function checkAnswer(currentNote: GameNote, selectedNote: SolfegeNote): boolean {
  return currentNote.note.solfege === selectedNote
}

export function createLesson5AnswerHandler(
  game: ReturnType<typeof useLesson5Store>,
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
