import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'running-metrics-theme'

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const getInitialTheme = (): Theme => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') {
        return stored
      }
      
      // Check system preference
      if (window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        return prefersDark ? 'dark' : 'light'
      }
    }
    
    // Default to light
    return 'light'
  }

  const [theme, setTheme] = useState<Theme>(() => {
    const initialTheme = getInitialTheme()
    // Apply immediately to avoid flash
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (initialTheme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    return initialTheme
  })

  // Apply theme to document root whenever it changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  // Listen for system theme changes (only if no manual preference set)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't manually set a preference
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      return newTheme
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
