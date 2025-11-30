export function needsLedgerLine(position: number): boolean {
  return position <= -4 || position >= 4
}

export function getStemDirection(position: number): 'up' | 'down' {
  return position >= 0 ? 'down' : 'up'
}

