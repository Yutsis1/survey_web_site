'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [isClient, setIsClient] = useState(false)

    // Initialize theme from localStorage on mount
    useEffect(() => {
        setIsClient(true)
        const storedTheme = localStorage.getItem('theme-preference') as Theme | null
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light')
        setTheme(initialTheme)
        applyTheme(initialTheme)
    }, [])

    const applyTheme = (newTheme: Theme) => {
        const htmlElement = document.documentElement
        if (newTheme === 'light') {
            htmlElement.classList.add('light')
        } else {
            htmlElement.classList.remove('light')
        }
        localStorage.setItem('theme-preference', newTheme)
    }

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        applyTheme(newTheme)
    }

    // Prevent rendering until client-side hydration is complete
    if (!isClient) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
