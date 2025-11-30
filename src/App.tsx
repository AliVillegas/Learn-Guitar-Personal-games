import { useTranslation } from 'react-i18next'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher'
import { ConfigPage } from './pages/ConfigPage'
import { GamePage } from './pages/GamePage'
import { VERSION } from './version'
import './App.css'

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
          <Route path="/" element={<Navigate to="/config" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-border bg-background mt-auto">
        <div className="container mx-auto px-4 py-2 flex justify-center">
          <span className="text-xs text-muted-foreground">v{VERSION}</span>
        </div>
      </footer>
    </div>
  )
}

export default App
