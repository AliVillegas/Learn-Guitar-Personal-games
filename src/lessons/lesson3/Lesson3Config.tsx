import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ConfigSection } from '../../components/ConfigSection/ConfigSection'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { useLesson3Store } from './lesson3Store'
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
  const lessonStore = useLesson3Store.getState()
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
  const lessonStore = useLesson3Store.getState()
  const settingsStore = useSettingsStore.getState()

  lessonStore.setConfig({ instrument })
  settingsStore.setInstrument(instrument)
}

function handleChangeScaleType(scaleType: 'major' | 'minor') {
  const lessonStore = useLesson3Store.getState()
  lessonStore.setConfig({ scaleType })
}

export function Lesson3Config() {
  const { t } = useTranslation()
  const game = useLesson3Store()

  const handleGenerate = () => {
    game.generateSequence()
  }

  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChangeScaleType(e.target.value as 'major' | 'minor')
  }

  return (
    <div className="space-y-4">
      <BackToHomeButton />
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">{t('config.scaleType')}:</label>
          <Select value={game.config.scaleType} onChange={handleScaleChange} className="w-32">
            <option value="major">{t('config.scaleTypes.major')}</option>
            <option value="minor">{t('config.scaleTypes.minor')}</option>
          </Select>
        </div>
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
    </div>
  )
}
