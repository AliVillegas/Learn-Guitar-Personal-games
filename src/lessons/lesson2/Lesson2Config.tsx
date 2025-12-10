import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { useLesson2Store } from './lesson2Store'
import type { MultiVoiceMeasureCount } from '../../types/music'

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

function handleChangeStackedNotes(allowStacked: boolean) {
  const lessonStore = useLesson2Store.getState()
  lessonStore.setConfig({ allowStackedNotes: allowStacked })
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

function renderStackedNotesOption(
  t: (key: string) => string,
  allowStacked: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="stacked-notes" checked={allowStacked} onChange={onChange} />
      <label htmlFor="stacked-notes" className="text-sm font-medium text-foreground cursor-pointer">
        {t('config.stackedNotes')}
      </label>
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

  const handleStackedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChangeStackedNotes(e.target.checked)
  }

  const handleGenerate = () => {
    game.generateSequence()
  }

  return (
    <div className="space-y-4">
      <BackToHomeButton />
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {renderMeasureSelector(t, game.config.measureCount, handleMeasureChange)}
        {renderStackedNotesOption(t, game.config.allowStackedNotes, handleStackedChange)}
        <Button onClick={handleGenerate} className="w-full" size="lg">
          {t('config.generate')}
        </Button>
      </div>
    </div>
  )
}
