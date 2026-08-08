'use client'

import * as React from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'argus-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    const saved = localStorage.getItem(storageKey) as Theme | null
    if (saved) {
      setThemeState(saved)
    }
  }, [storageKey])

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (e) {
      // Storage access error fallback
    }
    setThemeState(newTheme)
  }, [storageKey])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => React.useContext(ThemeContext)
