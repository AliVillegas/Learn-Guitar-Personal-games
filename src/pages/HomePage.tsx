import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useSettingsStore } from '../store/settingsStore'
import { useLesson1Store } from '../lessons/lesson1/lesson1Store'
import { useLesson2Store } from '../lessons/lesson2/lesson2Store'
import { useLesson3Store } from '../lessons/lesson3/lesson3Store'
import { useLesson4Store } from '../lessons/lesson4/lesson4Store'
import { useLesson5Store } from '../lessons/lesson5/lesson5Store'
import { useLesson6Store } from '../lessons/lesson6/lesson6Store'

function LessonCard({
  title,
  description,
  lessonNumber,
  onSelect,
}: {
  title: string
  description: string
  lessonNumber: number
  onSelect: (lessonNumber: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="bg-card border-2 border-border rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
      <h3 className="text-xl font-semibold text-card-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
      <Button onClick={() => onSelect(lessonNumber)} className="w-full" size="lg" variant="default">
        {t('home.startLesson')}
      </Button>
    </div>
  )
}

function LessonCards({ onSelect }: { onSelect: (lessonNumber: number) => void }) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl items-stretch">
      <LessonCard
        title={t('home.lesson1.title')}
        description={t('home.lesson1.description')}
        lessonNumber={1}
        onSelect={onSelect}
      />
      <LessonCard
        title={t('home.lesson2.title')}
        description={t('home.lesson2.description')}
        lessonNumber={2}
        onSelect={onSelect}
      />
      <LessonCard
        title={t('home.lesson3.title')}
        description={t('home.lesson3.description')}
        lessonNumber={3}
        onSelect={onSelect}
      />
      <LessonCard
        title={t('home.lesson4.title')}
        description={t('home.lesson4.description')}
        lessonNumber={4}
        onSelect={onSelect}
      />
      <LessonCard
        title={t('home.lesson5.title')}
        description={t('home.lesson5.description')}
        lessonNumber={5}
        onSelect={onSelect}
      />
      <LessonCard
        title={t('home.lesson6.title')}
        description={t('home.lesson6.description')}
        lessonNumber={6}
        onSelect={onSelect}
      />
    </div>
  )
}

function WhatsAppContactButton() {
  const { t } = useTranslation()
  const phoneNumber = '+5215520452723'
  const message = encodeURIComponent('Hola estoy interesado en clases de guitarra')
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <div className="mt-12 p-6 bg-card border-2 border-border rounded-lg text-center space-y-4">
      <p className="text-lg font-medium text-card-foreground">{t('app.wantToLearnMore')}</p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        {t('app.contactUs')}
      </a>
    </div>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLessonSelect = (lessonNumber: number) => {
    switch (lessonNumber) {
      case 1:
        useLesson1Store.getState().reset()
        navigate('/game/lesson1')
        break
      case 2:
        useLesson2Store.getState().reset()
        navigate('/game/lesson2')
        break
      case 3:
        useLesson3Store.getState().reset()
        navigate('/game/lesson3')
        break
      case 4:
        useLesson4Store.getState().reset()
        navigate('/game/lesson4')
        break
      case 5:
        useLesson5Store.getState().reset()
        navigate('/game/lesson5')
        break
      case 6:
        useLesson6Store.getState().reset()
        navigate('/game/lesson6')
        break
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <h2 className="text-3xl font-semibold text-foreground mb-8">{t('home.title')}</h2>
      <LessonCards onSelect={handleLessonSelect} />
      <WhatsAppContactButton />
    </div>
  )
}
