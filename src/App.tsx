import { useTranslation } from 'react-i18next'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher'
import { HomePage } from './pages/HomePage'
import { Lesson1Page } from './lessons/lesson1/Lesson1Page'
import { Lesson2Page } from './lessons/lesson2/Lesson2Page'
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

function AppHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {isHomePage ? (
          <h1 className="text-2xl font-semibold text-foreground">{t('app.homeTitle')}</h1>
        ) : (
          <Link
            to="/"
            className="text-2xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            {t('app.title')}
          </Link>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/lesson1" element={<Lesson1Page />} />
          <Route path="/game/lesson2" element={<Lesson2Page />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </main>

      <AppFooter />
    </div>
  )
}

export default App
