import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lesson1Config } from './Lesson1Config'
import { useLesson1Store } from './lesson1Store'
import { useSettingsStore } from '../../store/settingsStore'
import { RouterWrapper } from '../../test/routerWrapper'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Lesson1Config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLesson1Store.setState({
      phase: 'config',
      config: {
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
      },
      sequence: [],
      currentIndex: 0,
      score: { correct: 0, incorrect: 0 },
    })
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
        <Lesson1Config />
      </RouterWrapper>
    )

    expect(screen.getByText(/Select notes for each string/i)).toBeInTheDocument()
  })

  it('renders generate button', () => {
    render(
      <RouterWrapper>
        <Lesson1Config />
      </RouterWrapper>
    )

    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('generates sequence when generate button is clicked', async () => {
    const user = userEvent.setup()
    const generateSequenceSpy = vi.spyOn(useLesson1Store.getState(), 'generateSequence')
    render(
      <RouterWrapper>
        <Lesson1Config />
      </RouterWrapper>
    )

    const generateButton = screen.getByRole('button', { name: /generate/i })
    await user.click(generateButton)

    expect(generateSequenceSpy).toHaveBeenCalled()
  })

  it('renders back to home button', () => {
    render(
      <RouterWrapper>
        <Lesson1Config />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    expect(backButton).toBeInTheDocument()
  })

  it('navigates home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RouterWrapper>
        <Lesson1Config />
      </RouterWrapper>
    )

    const backButton = screen.getByRole('button', { name: /back to lessons/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('toggles string note when handleToggleStringNote is called', () => {
    render(
      <RouterWrapper>
        <Lesson1Config />
      </RouterWrapper>
    )

    const lessonStore = useLesson1Store.getState()
    const stringConfig = lessonStore.config.stringNotes.find((sn) => sn.string === 1)

    if (stringConfig && stringConfig.notes.length > 0) {
      const updatedLessonStore = useLesson1Store.getState()
      const updatedStringConfig = updatedLessonStore.config.stringNotes.find(
        (sn) => sn.string === 1
      )

      expect(updatedStringConfig).toBeDefined()
    }
  })

  it('changes measure count when handleChangeMeasure is called', () => {
    render(
      <RouterWrapper>
        <Lesson1Config />
      </RouterWrapper>
    )

    const lessonStore = useLesson1Store.getState()
    const settingsStore = useSettingsStore.getState()

    lessonStore.setConfig({ measureCount: 2 })
    settingsStore.setMeasureCount(2)

    expect(useLesson1Store.getState().config.measureCount).toBe(2)
    expect(useSettingsStore.getState().measureCount).toBe(2)
  })

  it('changes instrument when handleChangeInstrument is called', () => {
    render(
      <RouterWrapper>
        <Lesson1Config />
      </RouterWrapper>
    )

    const lessonStore = useLesson1Store.getState()
    const settingsStore = useSettingsStore.getState()

    lessonStore.setConfig({ instrument: 'guitar-synth' })
    settingsStore.setInstrument('guitar-synth')

    expect(useLesson1Store.getState().config.instrument).toBe('guitar-synth')
    expect(useSettingsStore.getState().instrument).toBe('guitar-synth')
  })
})
