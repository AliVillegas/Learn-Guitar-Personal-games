import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(newLang)
  }

  const buttonText = i18n.language === 'en' ? 'Español' : 'English'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="language-switcher"
    >
      {buttonText}
    </button>
  )
}

