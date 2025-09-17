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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const checkAuth = async () => {
        try {
            const res = await fetch(`${config.apiUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            })
            setIsAuthenticated(res.ok)
        } catch (error) {
            console.error('Auth check failed:', error)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        const res = await fetch(`${config.apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
            throw new Error('Failed to login')
        }
        setIsAuthenticated(true)
    }

    const register = async (email: string, password: string) => {
        const res = await fetch(`${config.apiUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
            throw new Error('Failed to register')
        }
        setIsAuthenticated(true)
    }

    const logout = async () => {
        try {
            await fetch(`${config.apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setIsAuthenticated(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
