import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useSettingsStore } from '../store/settingsStore'
import { useLesson1Store } from '../lessons/lesson1/lesson1Store'
import { useLesson2Store } from '../lessons/lesson2/lesson2Store'
import type { LessonType } from '../types/music'

function LessonCard({
  title,
  description,
  lessonType,
  onSelect,
}: {
  title: string
  description: string
  lessonType: LessonType
  onSelect: (lessonType: LessonType) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="bg-card border-2 border-border rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
      <h3 className="text-xl font-semibold text-card-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
      <Button onClick={() => onSelect(lessonType)} className="w-full" size="lg" variant="default">
        {t('home.startLesson')}
      </Button>
    </div>
  )
}

function LessonCards({ onSelect }: { onSelect: (lessonType: LessonType) => void }) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl items-stretch">
      <LessonCard
        title={t('home.lesson1.title')}
        description={t('home.lesson1.description')}
        lessonType="single-notes"
        onSelect={onSelect}
      />
      <LessonCard
        title={t('home.lesson2.title')}
        description={t('home.lesson2.description')}
        lessonType="multi-voice"
        onSelect={onSelect}
      />
    </div>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSelectedLesson = useSettingsStore((state) => state.setSelectedLesson)

  const handleLessonSelect = (lessonType: LessonType) => {
    setSelectedLesson(lessonType)

    if (lessonType === 'multi-voice') {
      useLesson2Store.getState().reset()
      navigate('/game/lesson2')
    } else {
      useLesson1Store.getState().reset()
      navigate('/game/lesson1')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <h2 className="text-3xl font-semibold text-foreground mb-8">{t('home.title')}</h2>
      <LessonCards onSelect={handleLessonSelect} />
    </div>
  )
}
