import type { SolfegeNote, MultiVoiceGameNote } from '../../types/music'
import { useLesson2Store } from './lesson2Store'
import { useLesson2Audio } from './useLesson2Audio'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { extractAllNotesFromMultiVoice } from '../../utils/sequenceHelpers'

type AudioHook = ReturnType<typeof useLesson2Audio>
type FeedbackHook = ReturnType<typeof useAnswerFeedback>

function handleIncorrectAnswer(
  selectedNote: SolfegeNote,
  currentNote: MultiVoiceGameNote,
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useLesson2Store>
): void {
  feedback.setFeedback(selectedNote, 'incorrect')
  const allNotes = extractAllNotesFromMultiVoice(currentNote)
  const promises = allNotes.map((note) => audio.playNote(note))
  Promise.all(promises).catch((error) => {
    console.error('Error playing notes:', error)
  })
  audio.playErrorSound()
  game.submitAnswer(selectedNote)
}

function handleCorrectAnswer(
  selectedNote: SolfegeNote,
  audio: AudioHook,
  feedback: FeedbackHook,
  game: ReturnType<typeof useLesson2Store>
): void {
  feedback.setFeedback(selectedNote, 'correct')
  audio.playSuccessSound()
  game.submitAnswer(selectedNote)
}

function checkAnswer(currentNote: MultiVoiceGameNote, selectedNote: SolfegeNote): boolean {
  const melodyNotes = currentNote.melodyVoice
    .filter((vn) => vn.note !== null)
    .map((vn) => {
      if (vn.note === null) return null
      return vn.note.solfege
    })
    .filter((solfege): solfege is SolfegeNote => solfege !== null)
  return melodyNotes.includes(selectedNote)
}

export function createLesson2AnswerHandler(
  game: ReturnType<typeof useLesson2Store>,
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
