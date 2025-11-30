import type { MeasureCount } from '../../types/music'

interface MeasureBarsProps {
  measureCount: MeasureCount
}

export function MeasureBars({ measureCount }: MeasureBarsProps) {
  return (
    <div className="measure-bars">
      {Array.from({ length: measureCount + 1 }).map((_, index) => (
        <div
          key={index}
          className="measure-bar"
          style={{ left: `${(index / measureCount) * 100}%` }}
        />
      ))}
    </div>
  )
}

