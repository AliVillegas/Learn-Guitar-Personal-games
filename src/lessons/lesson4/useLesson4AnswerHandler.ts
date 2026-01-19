import type { SolfegeNote, GameNote } from '../../types/music'
import { useLesson4Store } from './lesson4Store'
import { useLesson4Audio } from './useLesson4Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'

type AudioHook = ReturnType<typeof useLesson4Audio>
type FeedbackHook = ReturnType<typeof useAnswerFeedback>

function handleIncorrectAnswer(
  selectedNote: SolfegeNote,
  currentNote: GameNote,
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useLesson4Store>
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
  game: ReturnType<typeof useLesson4Store>
): void {
  feedback.setFeedback(selectedNote, 'correct')
  audio.playSuccessSound()
  game.submitAnswer(selectedNote)
}

function checkAnswer(currentNote: GameNote, selectedNote: SolfegeNote): boolean {
  return currentNote.note.solfege === selectedNote
}

export function createLesson4AnswerHandler(
  game: ReturnType<typeof useLesson4Store>,
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
