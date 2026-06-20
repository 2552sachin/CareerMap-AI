import { useState, useEffect } from 'react'
import Hero from './components/Hero'
import NotFound from './components/NotFound'
import { SettingsProvider } from './lib/settings'
import { ThemeProvider } from './lib/theme'

function useRoute(): { notFound: boolean } {
  const [notFound, setNotFound] = useState<boolean>(
    typeof window !== 'undefined' && window.location.pathname !== '/',
  )

  useEffect(() => {
    const handler = (): void => {
      setNotFound(window.location.pathname !== '/')
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  return { notFound }
}

export default function App() {
  const { notFound } = useRoute()

  if (notFound) {
    return <NotFound />
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
          <Hero />
        </main>
      </SettingsProvider>
    </ThemeProvider>
  )
}
