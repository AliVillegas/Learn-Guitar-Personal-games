import { useTranslation } from 'react-i18next'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher'
import { HomePage } from './pages/HomePage'
import { Lesson1Page } from './lessons/lesson1/Lesson1Page'
import { Lesson2Page } from './lessons/lesson2/Lesson2Page'
import { Lesson3Page } from './lessons/lesson3/Lesson3Page'
import { Lesson4Page } from './lessons/lesson4/Lesson4Page'
import { Lesson5Page } from './lessons/lesson5/Lesson5Page'
import { Lesson6Page } from './lessons/lesson6/Lesson6Page'
import { DebugPage } from './pages/DebugPage'
import { VERSION } from './version'
import './App.css'

function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-center items-center gap-4">
        <span className="text-xs text-muted-foreground">v{VERSION}</span>
        <span className="hidden md:inline text-muted-foreground">•</span>
        <Link
          to="/debug"
          className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
        >
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
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {isHomePage ? (
          <h1 className="text-2xl md:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            {t('app.homeTitle')}
          </h1>
        ) : (
          <Link
            to="/"
            className="text-2xl md:text-3xl font-bold text-foreground hover:text-primary transition-all duration-300 hover:scale-105"
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

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/lesson1" element={<Lesson1Page />} />
          <Route path="/game/lesson2" element={<Lesson2Page />} />
          <Route path="/game/lesson3" element={<Lesson3Page />} />
          <Route path="/game/lesson4" element={<Lesson4Page />} />
          <Route path="/game/lesson5" element={<Lesson5Page />} />
          <Route path="/game/lesson6" element={<Lesson6Page />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </main>

      <AppFooter />
    </div>
  )
}

export default App
