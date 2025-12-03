'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { config } from '@/config'
import { apiClient } from '../services/api-client'

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
export async function login(
    email: string,
    password: string
): Promise<Response> {
    const res = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
        throw new Error(
            `Failed to login: ${res.statusText}, status code: ${res.status}`
        )
    }
    return res
}

export async function register(
    email: string,
    password: string
): Promise<Response> {
    const res = await fetch(`${config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
        throw new Error(
            `Failed to register: ${res.statusText}, status code: ${res.status}`
        )
    }
    return res
}

export async function refresh(): Promise<Response> {
    const res = await fetch(`${config.apiUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
    })
    if (!res.ok) {
        throw new Error(
            `Failed to refresh token: ${res.statusText}, status code: ${res.status}`
        )
    }
    return res
}

export async function logout(accessToken: string): Promise<Response> {
    const res = await fetch(`${config.apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
        cache: 'no-store',
    })
    if (!res.ok) {
        throw new Error(
            `Failed to logout: ${res.statusText}, status code: ${res.status}`
        )
    }
    return res
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [tokenExpiry, setTokenExpiry] = useState<number | null>(null)

    const checkAuth = async () => {
        try {
            const res = await refresh()
            if (res.ok) {
                const data = await res.json()
                setAccessToken(data.access_token)
                setTokenExpiry(Date.now() + (data.expires_in || 900) * 1000) // default 15min
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
                setAccessToken(null)
                setTokenExpiry(null)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setIsAuthenticated(false)
            setAccessToken(null)
            setTokenExpiry(null)
        } finally {
            setIsLoading(false)
        }
    }

    // Rename these functions to avoid naming conflicts
    const handleLogin = async (email: string, password: string) => {
        const res = await login(email, password) // calls the imported login function
        if (res.ok) {
            const data = await res.json()
            setAccessToken(data.access_token)
            setTokenExpiry(Date.now() + data.expires_in * 1000)
            setIsAuthenticated(true)
        }
    }

    const handleRegister = async (email: string, password: string) => {
        const res = await register(email, password) // calls the imported register function
        if (res.ok) {
            const data = await res.json()
            setAccessToken(data.access_token)
            setTokenExpiry(Date.now() + data.expires_in * 1000)
            setIsAuthenticated(true)
        }
    }
    const handleLogout = async () => {
        if (accessToken) {
            const res = await logout(accessToken)
            if (res.ok) {
                setAccessToken(null)
                setTokenExpiry(null)
                setIsAuthenticated(false)
            }
        }
    }

    // Add automatic token refresh before expiry
    useEffect(() => {
        if (!tokenExpiry || !accessToken) return

        const timeUntilExpiry = tokenExpiry - Date.now()
        const refreshTime = Math.max(timeUntilExpiry - 60000, 0) // Refresh 1min before expiry

        const timer = setTimeout(() => {
            refresh()
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setAccessToken(data.access_token)
                            setTokenExpiry(Date.now() + data.expires_in * 1000)
                        })
                    }
                })
                .catch(() => setIsAuthenticated(false))
        }, refreshTime)

        return () => clearTimeout(timer)
    }, [accessToken, tokenExpiry])

    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        apiClient.initialize(
            () => accessToken,
            () => {
                setIsAuthenticated(false)
                setAccessToken(null)
            }
        )
    }, [accessToken])

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                login: handleLogin, // Use the renamed function
                register: handleRegister, // Use the renamed function
                logout: handleLogout, // Use the renamed function
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
