import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher'
import { AppContent } from './components/AppContent/AppContent'
import { useAppHandlers } from './hooks/useAppHandlers'
import './App.css'

function App() {
  const { t } = useTranslation()
  const handlers = useAppHandlers()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <AppContent handlers={handlers} />
      </main>
    </div>
  )
}

export default App
