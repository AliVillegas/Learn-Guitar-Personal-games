import { useTranslation } from 'react-i18next'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher'
import { ConfigPage } from './pages/ConfigPage'
import { GamePage } from './pages/GamePage'
import { DebugPage } from './pages/DebugPage'
import { VERSION } from './version'
import './App.css'

function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-2 flex justify-center items-center gap-4">
        <span className="text-xs text-muted-foreground">v{VERSION}</span>
        <Link to="/debug" className="text-xs text-muted-foreground hover:text-foreground underline">
          {t('debug.title')}
        </Link>
      </div>
    </footer>
  )
}

function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">{t('app.title')}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Routes>
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/" element={<Navigate to="/config" replace />} />
        </Routes>
      </main>

      <AppFooter />
    </div>
  )
}

export default App
