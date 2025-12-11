import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { useLesson2Store } from './lesson2Store'
import type { MultiVoiceMeasureCount } from '../../types/music'

type NoteMode = 'single' | 'stacked' | 'mixed'

function BackToHomeButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Button onClick={() => navigate('/')} variant="ghost" className="mb-4">
      {t('app.backToHome')}
    </Button>
  )
}

function handleChangeMeasure(count: MultiVoiceMeasureCount) {
  const lessonStore = useLesson2Store.getState()
  lessonStore.setConfig({ measureCount: count })
}

function handleChangeNoteMode(noteMode: NoteMode) {
  const lessonStore = useLesson2Store.getState()
  lessonStore.setConfig({ noteMode })
}

function renderMeasureSelector(
  t: (key: string) => string,
  measureCount: MultiVoiceMeasureCount,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground">{t('config.measures')}:</label>
      <Select value={measureCount} onChange={onChange} className="w-24">
        <option value={4}>4</option>
        <option value={5}>5</option>
        <option value={6}>6</option>
        <option value={7}>7</option>
        <option value={8}>8</option>
      </Select>
    </div>
  )
}

function renderNoteModeSelector(
  t: (key: string) => string,
  noteMode: NoteMode,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground">{t('config.noteMode')}:</label>
      <Select value={noteMode} onChange={onChange} className="w-32">
        <option value="single">{t('config.noteModes.single')}</option>
        <option value="stacked">{t('config.noteModes.stacked')}</option>
        <option value="mixed">{t('config.noteModes.mixed')}</option>
      </Select>
    </div>
  )
}

export function Lesson2Config() {
  const { t } = useTranslation()
  const game = useLesson2Store()

  const handleMeasureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value) as MultiVoiceMeasureCount
    handleChangeMeasure(value)
  }

  const handleNoteModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as NoteMode
    handleChangeNoteMode(value)
  }

  const handleGenerate = () => {
    game.generateSequence()
  }

  return (
    <div className="space-y-4">
      <BackToHomeButton />
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {renderMeasureSelector(t, game.config.measureCount, handleMeasureChange)}
        {renderNoteModeSelector(t, game.config.noteMode, handleNoteModeChange)}
        <Button onClick={handleGenerate} className="w-full" size="lg">
          {t('config.generate')}
        </Button>
      </div>
    </div>
  )
}
