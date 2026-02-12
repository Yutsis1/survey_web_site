'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'
import { DynamicComponentRenderer } from '../components/dynamic-component-renderer'
import { z } from 'zod'
import './auth.css'

export default function AuthPage() {
    const emailSchema = z.email({ message: 'Invalid email address' })
    const passwordSchema = z
        .string()
        .min(8, { error: 'Password must be at least 8 characters long' })
        .max(20, { error: 'Password must not exceed 20 characters' })
        .refine((val) => /[A-Z]/.test(val), {
            message: 'Password must contain at least one uppercase letter',
        })
        .refine((val) => /[a-z]/.test(val), {
            message: 'Password must contain at least one lowercase letter',
        })
        .refine((val) => /[0-9]/.test(val), {
            message: 'Password must contain at least one number',
        })
        .refine((val) => /[!@#$%^&*]/.test(val), {
            message: 'Password must contain at least one special character',
        })
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeat, setRepeat] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { login, register, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/survey-builder')
        }
    }, [isAuthenticated, isLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            if (mode === 'register') {
                if (password !== repeat) {
                    setError('Passwords do not match')
                    return
                }
                await register(email, password)
            } else {
                await login(email, password)
            }
            router.push('/survey-builder')
        } catch (error) {
            console.error('Auth error:', error)
            setError('Authentication failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Show loading while checking authentication status
    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                Loading...
            </div>
        )
    }

    // Don't render if already authenticated (will redirect)
    if (isAuthenticated) {
        return null
    }

    return (
        <div className="auth-container">
            <main className="auth-box">
                <div className="auth-email">
                    {/* Email Input */}
                    <DynamicComponentRenderer
                        component="TextInput"
                        option={{
                            optionProps: {
                                label: 'Email',
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                                type: 'email',
                                placeholder: 'Enter your email',
                                test_id: 'input-email',
                                name: 'email',
                            },
                        }}
                        questionText="Email"
                        showQuestionText={false}
                    />
                </div>
                {email && !emailSchema.safeParse(email).success && (
                    <DynamicComponentRenderer
                        component="InfoLabel"
                        option={{
                            optionProps: {
                                text: 'Invalid email address',
                                type: 'error',
                                test_id: 'info-error',
                            },
                        }}
                        questionText=""
                        showQuestionText={false}
                    />
                )}
                {/* Password Input */}
                <div className="auth-password">
                    <DynamicComponentRenderer
                        component="TextInput"
                        option={{
                            optionProps: {
                                label: 'Password',
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                                type: 'password',
                                placeholder: 'Enter your password',
                                test_id: 'input-password',
                                name: 'password',
                            },
                        }}
                        questionText="Password"
                        showQuestionText={false}
                    />
                </div>
                {mode === 'register' && password && (() => {
                    const parsed = passwordSchema.safeParse(password)
                    if (!parsed.success) {
                        const msgs = parsed.error.issues
                            .map((err) => err.message)
                            .join('\n')
                        return (
                            <div className="auth-password-errors">
                                <DynamicComponentRenderer
                                    component="InfoLabel"
                                    option={{
                                        optionProps: {
                                            text: msgs,
                                            type: 'error',
                                            test_id: 'info-error',
                                        },
                                    }}
                                    questionText=""
                                    showQuestionText={false}
                                />
                            </div>
                        )
                    }
                    return null
                })()}
                {mode === 'register' && (
                    <div className="auth-repeat">
                        <DynamicComponentRenderer
                            component="TextInput"
                            option={{
                                optionProps: {
                                    label: 'Repeat Password',
                                    value: repeat,
                                    onChange: (e) => setRepeat(e.target.value),
                                    type: 'password',
                                    placeholder: 'Repeat your password',
                                    test_id: 'input-repeat-password',
                                    name: 'repeat-password',
                                },
                            }}
                            questionText="Repeat Password"
                            showQuestionText={false}
                        />
                    </div>
                )}
                {error && (
                    <DynamicComponentRenderer
                        component="InfoLabel"
                        option={{
                            optionProps: {
                                text: error,
                                type: 'error',
                                test_id: 'info-error',
                            },
                        }}
                        questionText=""
                        showQuestionText={false}
                    />
                )}
                <DynamicComponentRenderer
                    component="Button"
                    option={{
                        optionProps: {
                            onClick: handleSubmit,
                            label: isSubmitting
                                ? mode === 'login'
                                    ? 'Logging in...'
                                    : 'Registering...'
                                : mode === 'login'
                                  ? 'Login'
                                  : 'Register',
                            test_id: 'auth-submit',
                            disabled: isSubmitting,
                        },
                    }}
                    questionText=""
                    showQuestionText={false}
                />
                <p>
                    {mode === 'login'
                        ? "Don't have an account? "
                        : 'Already have an account? '}
                    <a
                        data-testid="toggle-mode"
                        onClick={() =>
                            setMode(mode === 'login' ? 'register' : 'login')
                        }
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                    >
                        {mode === 'login' ? 'Register' : 'Login'}
                    </a>
                </p>
            </main>
        </div>
    )
}
