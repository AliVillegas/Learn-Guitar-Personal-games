import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(newLang)
  }

  const buttonText = i18n.language === 'en' ? 'Español' : 'English'

  return (
    <Button type="button" onClick={toggleLanguage} variant="outline" size="sm">
      {buttonText}
    </Button>
  )
}
