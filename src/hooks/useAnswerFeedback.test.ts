import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnswerFeedback } from './useAnswerFeedback'
import { getAllSolfegeNotes } from '../utils/notes'

describe('useAnswerFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('initializes with idle state for all notes', () => {
    const { result } = renderHook(() => useAnswerFeedback())
    const allNotes = getAllSolfegeNotes()

    allNotes.forEach((note) => {
      expect(result.current.feedbackState[note]).toBe('idle')
    })
  })

  it('sets feedback to correct', () => {
    const { result } = renderHook(() => useAnswerFeedback())

    act(() => {
      result.current.setFeedback('mi', 'correct')
    })

    expect(result.current.feedbackState.mi).toBe('correct')
  })

  it('sets feedback to incorrect', () => {
    const { result } = renderHook(() => useAnswerFeedback())

    act(() => {
      result.current.setFeedback('fa', 'incorrect')
    })

    expect(result.current.feedbackState.fa).toBe('incorrect')
  })

  it('resets all feedback to idle', () => {
    const { result } = renderHook(() => useAnswerFeedback())

    act(() => {
      result.current.setFeedback('mi', 'correct')
      result.current.setFeedback('fa', 'incorrect')
    })

    expect(result.current.feedbackState.mi).toBe('correct')
    expect(result.current.feedbackState.fa).toBe('incorrect')

    act(() => {
      result.current.reset()
    })

    const allNotes = getAllSolfegeNotes()
    allNotes.forEach((note) => {
      expect(result.current.feedbackState[note]).toBe('idle')
    })
  })
})
