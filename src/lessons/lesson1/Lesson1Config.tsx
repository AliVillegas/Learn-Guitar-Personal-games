import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ConfigSection } from '../../components/ConfigSection/ConfigSection'
import { Button } from '../../components/ui/button'
import { useLesson1Store } from './lesson1Store'
import { useSettingsStore } from '../../store/settingsStore'
import type { GuitarString, SolfegeNote, MeasureCount } from '../../types/music'
import type { InstrumentType } from '../../types/audio'

function BackToHomeButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Button onClick={() => navigate('/')} variant="ghost" className="mb-4">
      {t('app.backToHome')}
    </Button>
  )
}

function handleToggleStringNote(guitarString: GuitarString, note: SolfegeNote) {
  const lessonStore = useLesson1Store.getState()
  const settingsStore = useSettingsStore.getState()

  const stringConfig = lessonStore.config.stringNotes.find((sn) => sn.string === guitarString)
  if (!stringConfig) return

  const isSelected = stringConfig.notes.includes(note)
  const newNotes = isSelected
    ? stringConfig.notes.filter((n) => n !== note)
    : [...stringConfig.notes, note]

  const updatedStringNotes = lessonStore.config.stringNotes.map((sn) =>
    sn.string === guitarString ? { ...sn, notes: newNotes } : sn
  )

  lessonStore.setConfig({ stringNotes: updatedStringNotes })
  settingsStore.setStringNotes(updatedStringNotes)
}

function handleChangeMeasure(count: MeasureCount) {
  const lessonStore = useLesson1Store.getState()
  const settingsStore = useSettingsStore.getState()

  lessonStore.setConfig({ measureCount: count })
  settingsStore.setMeasureCount(count)
}

function handleChangeInstrument(instrument: InstrumentType) {
  const lessonStore = useLesson1Store.getState()
  const settingsStore = useSettingsStore.getState()

  lessonStore.setConfig({ instrument })
  settingsStore.setInstrument(instrument)
}

export function Lesson1Config() {
  const game = useLesson1Store()

  const handleGenerate = () => {
    game.generateSequence()
  }

  return (
    <div className="space-y-4">
      <BackToHomeButton />
      <ConfigSection
        stringNotes={game.config.stringNotes}
        measureCount={game.config.measureCount}
        instrument={game.config.instrument}
        onToggleStringNote={handleToggleStringNote}
        onChangeMeasure={handleChangeMeasure}
        onChangeInstrument={handleChangeInstrument}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
