import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BpmControl } from './BpmControl'
import { useSettingsStore } from '../../store/settingsStore'

const renderWithI18n = (component: React.ReactElement) => {
  return render(component)
}

describe('BpmControl', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      playbackBpm: 120,
    })
  })

  it('renders the cog icon button', () => {
    renderWithI18n(<BpmControl />)

    expect(screen.getByRole('button', { name: /speed settings/i })).toBeInTheDocument()
  })

  it('shows slider when cog icon is clicked', async () => {
    const user = userEvent.setup()
    renderWithI18n(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByText('BPM')).toBeInTheDocument()
  })

  it('hides slider when cog icon is clicked again', async () => {
    const user = userEvent.setup()
    renderWithI18n(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)
    expect(screen.getByRole('slider')).toBeInTheDocument()

    await user.click(cogButton)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('displays current BPM value', async () => {
    const user = userEvent.setup()
    renderWithI18n(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('updates BPM when slider is changed', async () => {
    const user = userEvent.setup()
    renderWithI18n(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '80' } })

    expect(useSettingsStore.getState().playbackBpm).toBe(80)
    expect(screen.getByText('80')).toBeInTheDocument()
  })

  it('has correct min and max values on slider', async () => {
    const user = userEvent.setup()
    renderWithI18n(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '40')
    expect(slider).toHaveAttribute('max', '200')
  })
})
