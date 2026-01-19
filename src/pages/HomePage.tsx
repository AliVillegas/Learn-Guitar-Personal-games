import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { useLesson1Store } from '../lessons/lesson1/lesson1Store'
import { useLesson2Store } from '../lessons/lesson2/lesson2Store'
import { useLesson3Store } from '../lessons/lesson3/lesson3Store'
import { useLesson4Store } from '../lessons/lesson4/lesson4Store'
import { useLesson5Store } from '../lessons/lesson5/lesson5Store'
import { useLesson6Store } from '../lessons/lesson6/lesson6Store'

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

function HeroFeatures() {
  const { t } = useTranslation()

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
    >
      <span>{t('home.feature1')}</span>
      <span>{t('home.feature2')}</span>
      <span>{t('home.feature3')}</span>
    </motion.div>
  )
}

function HeroSection() {
  const { t } = useTranslation()

  return (
    <div className="relative w-full overflow-hidden mb-16">
      <div className="absolute inset-0 bg-gradient-musical opacity-5"></div>
      <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-bold text-foreground mb-6"
          {...fadeInUp}
        >
          {t('home.heroTitle')}
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          {t('home.heroSubtitle')}
        </motion.p>
        <HeroFeatures />
      </div>
    </div>
  )
}

function LessonCardHeader({ title, lessonNumber }: { title: string; lessonNumber: number }) {
  const { t } = useTranslation()

  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xl font-bold text-card-foreground flex-1">{title}</h3>
      </div>
      <span className="inline-block text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full whitespace-nowrap">
        {t('home.lesson')} {lessonNumber}
      </span>
    </div>
  )
}

function LessonCardContent({
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
    <div className="relative z-10">
      <LessonCardHeader title={title} lessonNumber={lessonNumber} />
      <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">{description}</p>
      <Button onClick={() => onSelect(lessonNumber)} className="w-full" size="lg" variant="default">
        {t('home.startLesson')}
      </Button>
    </div>
  )
}

function LessonCard({
  title,
  description,
  lessonNumber,
  onSelect,
  delay = 0,
}: {
  title: string
  description: string
  lessonNumber: number
  onSelect: (lessonNumber: number) => void
  delay?: number
}) {
  return (
    <motion.div
      className="bg-card border-2 border-border rounded-xl p-6 hover:shadow-medium hover:-translate-y-1 transition-all duration-200 flex flex-col h-full group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: 'easeOut' }}
    >
      <LessonCardContent
        title={title}
        description={description}
        lessonNumber={lessonNumber}
        onSelect={onSelect}
      />
    </motion.div>
  )
}

const LESSON_DATA = [
  { key: 'lesson1', number: 1, delay: 0 },
  { key: 'lesson2', number: 2, delay: 100 },
  { key: 'lesson3', number: 3, delay: 200 },
  { key: 'lesson4', number: 4, delay: 300 },
  { key: 'lesson5', number: 5, delay: 400 },
  { key: 'lesson6', number: 6, delay: 500 },
] as const

function LessonCards({ onSelect }: { onSelect: (lessonNumber: number) => void }) {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
        {t('home.title')}
      </h2>
      <p className="text-muted-foreground text-center mb-12 text-lg max-w-2xl mx-auto">
        {t('home.lessonsDescription')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {LESSON_DATA.map((lesson) => (
          <LessonCard
            key={lesson.key}
            title={t(`home.${lesson.key}.title`)}
            description={t(`home.${lesson.key}.description`)}
            lessonNumber={lesson.number}
            onSelect={onSelect}
            delay={lesson.delay}
          />
        ))}
      </div>
    </div>
  )
}

function CTATrustStats() {
  const { t } = useTranslation()
  const stats = [
    { value: '6', label: t('home.ctaStat1') },
    { value: '100%', label: t('home.ctaStat2') },
    { value: '24/7', label: t('home.ctaStat3') },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-6 my-8 text-sm">
      {stats.map((stat) => (
        <div key={stat.value} className="flex flex-col items-center gap-2">
          <div className="text-3xl font-bold text-primary">{stat.value}</div>
          <div className="text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

function WhatsAppButton() {
  const { t } = useTranslation()
  const phoneNumber = '+5215520452723'
  const message = encodeURIComponent('Hola estoy interesado en clases de guitarra')
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-8 py-4 rounded-xl text-lg shadow-medium"
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
      {t('app.contactUs')}
    </motion.a>
  )
}

function CTAContent() {
  const { t } = useTranslation()

  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('home.ctaTitle')}</h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        {t('home.ctaSubtitle')}
      </p>
      <CTATrustStats />
      <WhatsAppButton />
      <p className="text-sm text-muted-foreground mt-4">{t('home.ctaFooter')}</p>
    </motion.div>
  )
}

function WhatsAppCTASection() {
  return (
    <section className="relative w-full mt-20 mb-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-musical opacity-10"></div>
      <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20">
        <motion.div
          className="bg-gradient-to-br from-primary/10 via-indigo-50/50 to-purple-50/50 rounded-2xl p-8 md:p-12 border-2 border-primary/20 shadow-large"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <CTAContent />
        </motion.div>
      </div>
    </section>
  )
}

const LESSON_STORES = [
  useLesson1Store,
  useLesson2Store,
  useLesson3Store,
  useLesson4Store,
  useLesson5Store,
  useLesson6Store,
] as const

const LESSON_PATHS = [
  '/game/lesson1',
  '/game/lesson2',
  '/game/lesson3',
  '/game/lesson4',
  '/game/lesson5',
  '/game/lesson6',
] as const

export function HomePage() {
  const navigate = useNavigate()

  const handleLessonSelect = (lessonNumber: number) => {
    const index = lessonNumber - 1
    if (index >= 0 && index < LESSON_STORES.length) {
      LESSON_STORES[index].getState().reset()
      navigate(LESSON_PATHS[index])
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <HeroSection />
      <div className="w-full flex justify-center px-4">
        <LessonCards onSelect={handleLessonSelect} />
      </div>
      <WhatsAppCTASection />
    </div>
  )
}
