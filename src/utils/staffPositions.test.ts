import { describe, it, expect } from 'vitest'
import { needsLedgerLine, getStemDirection } from './staffPositions'

describe('needsLedgerLine', () => {
  it('returns true for C3 below staff', () => {
    expect(needsLedgerLine(-5)).toBe(true)
  })

  it('returns false for A3 on staff', () => {
    expect(needsLedgerLine(0)).toBe(false)
  })

  it('returns true for high G above staff', () => {
    expect(needsLedgerLine(6)).toBe(true)
  })
})

describe('getStemDirection', () => {
  it('returns down for notes on or above middle line', () => {
    expect(getStemDirection(0)).toBe('down')
    expect(getStemDirection(2)).toBe('down')
  })

  it('returns up for notes below middle line', () => {
    expect(getStemDirection(-1)).toBe('up')
    expect(getStemDirection(-3)).toBe('up')
  })
})
