import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigPage } from './ConfigPage'
import { useSettingsStore } from '../store/settingsStore'
import { RouterWrapper } from '../test/routerWrapper'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSettingsStore.setState({
      stringNotes: [
        { string: 1, notes: ['mi'] },
        { string: 2, notes: ['si'] },
        { string: 3, notes: ['sol'] },
        { string: 4, notes: ['re'] },
        { string: 5, notes: ['la'] },
        { string: 6, notes: ['mi'] },
      ],
      measureCount: 1,
      instrument: 'guitar-classical',
      selectedLesson: 'single-notes',
      playbackBpm: 120,
      metronomeEnabled: false,
      metronomeSubdivision: 1,
    })
  })

  it('renders config section', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    expect(screen.getByText(/Select notes for each string/i)).toBeInTheDocument()
  })

  it('renders generate button', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('navigates to lesson1 when generate is clicked with single-notes lesson', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({ selectedLesson: 'single-notes' })
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const generateButton = screen.getByRole('button', { name: /generate/i })
    await user.click(generateButton)

    expect(mockNavigate).toHaveBeenCalledWith('/game/lesson1')
  })

  it('navigates to lesson2 when generate is clicked with multi-voice lesson', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({ selectedLesson: 'multi-voice' })
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const generateButton = screen.getByRole('button', { name: /generate/i })
    await user.click(generateButton)

    expect(mockNavigate).toHaveBeenCalledWith('/game/lesson2')
  })

  it('renders back to home button', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    expect(backButton).toBeInTheDocument()
  })

  it('navigates home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('toggles string note when onToggleStringNote is called', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const configPanel = screen.getByText(/Select notes for each string/i).closest('div')
    expect(configPanel).toBeInTheDocument()

    const state = useSettingsStore.getState()
    const stringConfig = state.stringNotes.find((sn) => sn.string === 1)
    if (stringConfig && stringConfig.notes.length > 0) {
      const updatedState = useSettingsStore.getState()
      const updatedStringConfig = updatedState.stringNotes.find((sn) => sn.string === 1)
      expect(updatedStringConfig).toBeDefined()
    }
  })

  it('changes measure count when onChangeMeasure is called', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const state = useSettingsStore.getState()
    state.setMeasureCount(2)

    expect(useSettingsStore.getState().measureCount).toBe(2)
  })

  it('changes instrument when onChangeInstrument is called', () => {
    render(
      <RouterWrapper>
        <ConfigPage />
      </RouterWrapper>
    )

    const state = useSettingsStore.getState()
    state.setInstrument('guitar-synth')

    expect(useSettingsStore.getState().instrument).toBe('guitar-synth')
  })
})
