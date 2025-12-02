import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BpmControl } from './BpmControl'
import { useSettingsStore } from '../../store/settingsStore'

describe('BpmControl', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      playbackBpm: 120,
      metronomeEnabled: false,
      metronomeSubdivision: 1,
    })
  })

  it('renders the cog icon button', () => {
    render(<BpmControl />)

    expect(screen.getByRole('button', { name: /speed settings/i })).toBeInTheDocument()
  })

  it('shows slider when cog icon is clicked', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByText('BPM')).toBeInTheDocument()
  })

  it('hides slider when cog icon is clicked again', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)
    expect(screen.getByRole('slider')).toBeInTheDocument()

    await user.click(cogButton)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('displays current BPM value in editable input', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const bpmInput = screen.getByRole('textbox', { name: /bpm value/i })
    expect(bpmInput).toHaveValue('120')
  })

  it('updates BPM when slider is changed', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '80' } })

    expect(useSettingsStore.getState().playbackBpm).toBe(80)
    const bpmInput = screen.getByRole('textbox', { name: /bpm value/i })
    expect(bpmInput).toHaveValue('80')
  })

  it('has correct min and max values on slider', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '20')
    expect(slider).toHaveAttribute('max', '200')
  })

  it('updates BPM when valid value is typed in input', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const bpmInput = screen.getByRole('textbox', { name: /bpm value/i })
    await user.clear(bpmInput)
    await user.type(bpmInput, '75')

    expect(useSettingsStore.getState().playbackBpm).toBe(75)
  })

  it('clamps value to max when input exceeds maximum on blur', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const bpmInput = screen.getByRole('textbox', { name: /bpm value/i })
    await user.clear(bpmInput)
    await user.type(bpmInput, '999')
    await user.tab()

    expect(useSettingsStore.getState().playbackBpm).toBe(200)
    expect(bpmInput).toHaveValue('200')
  })

  it('clamps value to min when input is below minimum on blur', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const bpmInput = screen.getByRole('textbox', { name: /bpm value/i })
    await user.clear(bpmInput)
    await user.type(bpmInput, '5')
    await user.tab()

    expect(useSettingsStore.getState().playbackBpm).toBe(20)
    expect(bpmInput).toHaveValue('20')
  })

  it('restores previous value when invalid input is entered and blurred', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const bpmInput = screen.getByRole('textbox', { name: /bpm value/i })
    await user.clear(bpmInput)
    await user.type(bpmInput, 'abc')
    await user.tab()

    expect(useSettingsStore.getState().playbackBpm).toBe(120)
    expect(bpmInput).toHaveValue('120')
  })

  it('updates value on Enter key press', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const bpmInput = screen.getByRole('textbox', { name: /bpm value/i })
    await user.clear(bpmInput)
    await user.type(bpmInput, '90{Enter}')

    expect(useSettingsStore.getState().playbackBpm).toBe(90)
  })

  it('shows metronome toggle when settings panel is open', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    expect(screen.getByRole('checkbox', { name: /metronome/i })).toBeInTheDocument()
    expect(screen.getByText('Metronome')).toBeInTheDocument()
  })

  it('metronome toggle is unchecked by default', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const metronomeCheckbox = screen.getByRole('checkbox', { name: /metronome/i })
    expect(metronomeCheckbox).not.toBeChecked()
  })

  it('toggles metronome setting when checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const metronomeCheckbox = screen.getByRole('checkbox', { name: /metronome/i })
    await user.click(metronomeCheckbox)

    expect(useSettingsStore.getState().metronomeEnabled).toBe(true)
    expect(metronomeCheckbox).toBeChecked()
  })

  it('can toggle metronome off after enabling', async () => {
    useSettingsStore.setState({ metronomeEnabled: true })
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const metronomeCheckbox = screen.getByRole('checkbox', { name: /metronome/i })
    expect(metronomeCheckbox).toBeChecked()

    await user.click(metronomeCheckbox)

    expect(useSettingsStore.getState().metronomeEnabled).toBe(false)
    expect(metronomeCheckbox).not.toBeChecked()
  })

  it('shows subdivision selector only when metronome is enabled', async () => {
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    expect(screen.queryByRole('group', { name: /subdivision/i })).not.toBeInTheDocument()

    const metronomeCheckbox = screen.getByRole('checkbox', { name: /metronome/i })
    await user.click(metronomeCheckbox)

    expect(screen.getByRole('group', { name: /subdivision/i })).toBeInTheDocument()
  })

  it('shows three subdivision options when metronome is enabled', async () => {
    useSettingsStore.setState({ metronomeEnabled: true })
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const subdivisionGroup = screen.getByRole('group', { name: /subdivision/i })
    const buttons = subdivisionGroup.querySelectorAll('button')
    expect(buttons).toHaveLength(3)
  })

  it('changes subdivision when option is clicked', async () => {
    useSettingsStore.setState({ metronomeEnabled: true, metronomeSubdivision: 1 })
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const eighthNoteButton = screen.getByRole('button', { name: '♪' })
    await user.click(eighthNoteButton)

    expect(useSettingsStore.getState().metronomeSubdivision).toBe(2)
  })

  it('changes subdivision to sixteenth notes', async () => {
    useSettingsStore.setState({ metronomeEnabled: true, metronomeSubdivision: 1 })
    const user = userEvent.setup()
    render(<BpmControl />)

    const cogButton = screen.getByRole('button', { name: /speed settings/i })
    await user.click(cogButton)

    const sixteenthNoteButton = screen.getByRole('button', { name: '♬' })
    await user.click(sixteenthNoteButton)

    expect(useSettingsStore.getState().metronomeSubdivision).toBe(4)
  })
})
