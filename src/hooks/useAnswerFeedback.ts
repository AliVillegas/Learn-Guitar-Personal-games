import { useState } from 'react'
import { createInitialFeedbackState } from '../utils/feedback'
import type { SolfegeNote } from '../types/music'

export function useAnswerFeedback() {
  const [feedbackState, setFeedbackState] = useState(createInitialFeedbackState)

  const reset = () => {
    setFeedbackState(createInitialFeedbackState())
  }

  const setFeedback = (note: SolfegeNote, state: 'correct' | 'incorrect') => {
    setFeedbackState((prev) => ({ ...prev, [note]: state }))
    setTimeout(() => {
      setFeedbackState((prev) => ({ ...prev, [note]: 'idle' }))
    }, 200)
  }

  return { feedbackState, setFeedback, reset }
}
