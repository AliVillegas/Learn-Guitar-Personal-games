import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DebugPage } from './DebugPage'
import { RouterWrapper } from '../test/routerWrapper'
import { useSettingsStore } from '../store/settingsStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../utils/audioEngines', () => ({
  getAudioEngine: vi.fn(() => ({
    playNote: vi.fn().mockResolvedValue(undefined),
  })),
  preloadGuitarSampler: vi.fn().mockResolvedValue(undefined),
}))

describe('DebugPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSettingsStore.setState({
      instrument: 'guitar-classical',
      selectedLesson: null,
      playbackBpm: 120,
      metronomeEnabled: false,
      metronomeSubdivision: 1,
    })
  })

  it('renders debug page title', () => {
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    expect(screen.getByText(/debug - note testing/i)).toBeInTheDocument()
  })

  it('renders back to config button', () => {
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to config/i })
    expect(backButton).toBeInTheDocument()
  })

  it('navigates to config when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to config/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/config')
  })

  it('renders all notes display section', () => {
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    expect(screen.getByText(/all notes combined/i)).toBeInTheDocument()
  })

  it('renders octave display section', () => {
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    expect(screen.getByText(/notes by octave/i)).toBeInTheDocument()
    expect(screen.getByText(/octave 3/i)).toBeInTheDocument()
    expect(screen.getByText(/octave 4/i)).toBeInTheDocument()
    expect(screen.getByText(/octave 5/i)).toBeInTheDocument()
  })

  it('renders note testing section', () => {
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    expect(screen.getByText(/test individual notes/i)).toBeInTheDocument()
  })

  it('renders string sections for all guitar strings', () => {
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    expect(screen.getAllByText(/1st string/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/2nd string/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/3rd string/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/4th string/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/5th string/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/6th string/i).length).toBeGreaterThan(0)
  })

  it('displays current instrument', () => {
    useSettingsStore.setState({ instrument: 'guitar-synth' })
    render(
      <RouterWrapper>
        <DebugPage />
      </RouterWrapper>
    )

    expect(screen.getByText(/guitar \(synth\)/i)).toBeInTheDocument()
  })
})
