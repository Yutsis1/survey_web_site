'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { config } from '@/config'

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// moved out of AuthProvider to being able to mock requests in tests
export async function login(email: string, password: string): Promise<Response>{
    const res = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
        throw new Error(`Failed to login: ${res.statusText}, status code: ${res.status}`)
    }
    return res
}

export async function register(email: string, password: string): Promise<Response>{
    const res = await fetch(`${config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
        throw new Error(`Failed to register: ${res.statusText}, status code: ${res.status}`)
    }
    return res
}

export async function refresh(): Promise<Response> {
    const res = await fetch(`${config.apiUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    })
    if (!res.ok) {
        throw new Error(`Failed to refresh token: ${res.statusText}, status code: ${res.status}`)
    }
    return res
}

export async function logout(): Promise<Response> {
    const res = await fetch(`${config.apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    })
    if (!res.ok) {
        throw new Error(`Failed to logout: ${res.statusText}, status code: ${res.status}`)
    }
    return res
}



export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const checkAuth = async () => {
        try {
            const res = await refresh()
            setIsAuthenticated(res.ok)
        } catch (error) {
            console.error('Auth check failed:', error)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    // Rename these functions to avoid naming conflicts
    const handleLogin = async (email: string, password: string) => {
        const res = await login(email, password)  // calls the imported login function
        setIsAuthenticated(true)
    }

    const handleRegister = async (email: string, password: string) => {
        const res = await register(email, password)  // calls the imported register function
        setIsAuthenticated(true)
    }
    const handleLogout = async () => {
       const res = await logout()
       setIsAuthenticated(false)
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                login: handleLogin,        // Use the renamed function
                register: handleRegister,  // Use the renamed function
                logout: handleLogout,       // Use the renamed function
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
