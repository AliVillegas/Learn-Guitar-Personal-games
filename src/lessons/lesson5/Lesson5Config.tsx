import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ConfigSection } from '../../components/ConfigSection/ConfigSection'
import { Button } from '../../components/ui/button'
import { useLesson5Store } from './lesson5Store'
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
  const lessonStore = useLesson5Store.getState()
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


function handleChangeInstrument(instrument: InstrumentType) {
  const lessonStore = useLesson5Store.getState()
  const settingsStore = useSettingsStore.getState()

  lessonStore.setConfig({ instrument })
  settingsStore.setInstrument(instrument)
}

export function Lesson5Config() {
  const game = useLesson5Store()

  const handleGenerate = () => {
    game.generateSequence()
  }

  return (
    <div className="space-y-4">
      <BackToHomeButton />
        <ConfigSection
          stringNotes={game.config.stringNotes}
          measureCount={4}
          instrument={game.config.instrument}
          onToggleStringNote={handleToggleStringNote}
          onChangeMeasure={() => {}}
          onChangeInstrument={handleChangeInstrument}
          onGenerate={handleGenerate}
          hideMeasureSelector={true}
        />
    </div>
  )
}
