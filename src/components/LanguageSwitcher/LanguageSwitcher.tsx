import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(newLang)
  }

  const targetFlag = i18n.language === 'en' ? '🇲🇽' : '🇺🇸'
  const buttonText = i18n.language === 'en' ? 'Español' : 'English'

  return (
    <Button type="button" onClick={toggleLanguage} variant="outline" size="sm" className="gap-2">
      <span>{targetFlag}</span>
      <span>{t('language.label')}</span>
      <span className="ml-1">{buttonText}</span>
    </Button>
  )
}
