import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MeasureBars } from './MeasureBars'

describe('MeasureBars', () => {
  it('renders correct number of bars for measureCount 1', () => {
    const { container } = render(<MeasureBars measureCount={1} />)
    const bars = container.querySelectorAll('.measure-bar')
    expect(bars).toHaveLength(2)
  })

  it('renders correct number of bars for measureCount 2', () => {
    const { container } = render(<MeasureBars measureCount={2} />)
    const bars = container.querySelectorAll('.measure-bar')
    expect(bars).toHaveLength(3)
  })

  it('renders correct number of bars for measureCount 4', () => {
    const { container } = render(<MeasureBars measureCount={4} />)
    const bars = container.querySelectorAll('.measure-bar')
    expect(bars).toHaveLength(5)
  })

  it('positions bars correctly', () => {
    const { container } = render(<MeasureBars measureCount={2} />)
    const bars = container.querySelectorAll('.measure-bar')

    expect(bars[0]).toHaveStyle({ left: '0%' })
    expect(bars[1]).toHaveStyle({ left: '50%' })
    expect(bars[2]).toHaveStyle({ left: '100%' })
  })
})
