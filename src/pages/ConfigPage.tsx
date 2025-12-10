import { useNavigate } from 'react-router-dom'
import { ConfigSection } from '../components/ConfigSection/ConfigSection'
import { Button } from '../components/ui/button'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../store/settingsStore'
import type { GuitarString, SolfegeNote } from '../types/music'

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
  const state = useSettingsStore.getState()
  const stringConfig = state.stringNotes.find((sn) => sn.string === guitarString)
  if (!stringConfig) return

  const isSelected = stringConfig.notes.includes(note)
  const newNotes = isSelected
    ? stringConfig.notes.filter((n) => n !== note)
    : [...stringConfig.notes, note]

  const updatedStringNotes = state.stringNotes.map((sn) =>
    sn.string === guitarString ? { ...sn, notes: newNotes } : sn
  )
  state.setStringNotes(updatedStringNotes)
}

export function ConfigPage() {
  const navigate = useNavigate()
  const settings = useSettingsStore()

  const handleGenerate = () => {
    const lessonType = settings.selectedLesson
    if (lessonType === 'multi-voice') {
      navigate('/game/lesson2')
    } else {
      navigate('/game/lesson1')
    }
  }

  return (
    <div className="space-y-4">
      <BackToHomeButton />
      <ConfigSection
        stringNotes={settings.stringNotes}
        measureCount={settings.measureCount}
        instrument={settings.instrument}
        onToggleStringNote={handleToggleStringNote}
        onChangeMeasure={settings.setMeasureCount}
        onChangeInstrument={settings.setInstrument}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
