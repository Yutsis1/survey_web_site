'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
            router.push('/dashboard')
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
                    setIsSubmitting(false)
                    return
                }
                const parsed = passwordSchema.safeParse(password)
                if (!parsed.success) {
                    setError(parsed.error.issues[0]?.message ?? 'Invalid password')
                    setIsSubmitting(false)
                    return
                }
                await register(email, password)
            } else {
                await login(email, password)
            }
            router.push('/dashboard')
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
            <div className="flex min-h-screen items-center justify-center">
                <div className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                    Loading...
                </div>
            </div>
        )
    }

    // Don't render if already authenticated (will redirect)
    if (isAuthenticated) {
        return null
    }

    const emailIsValid = !email || emailSchema.safeParse(email).success
    const passwordValidation = passwordSchema.safeParse(password)

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_40%)]" />
            <Card className="auth-box glass-card relative z-10 w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Survey Platform</div>
                    <CardTitle className="text-3xl">SurveyFlow</CardTitle>
                    <CardDescription>
                        Build and analyze modern surveys in one workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={mode}
                        onValueChange={(value: string) => {
                            setMode(value as 'login' | 'register')
                            setError(null)
                        }}
                    >
                        <TabsList className="mb-6 grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2" data-testid="input-email">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        placeholder="Enter your email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                                {!emailIsValid && (
                                    <p className="text-xs text-destructive" data-testid="info-error">
                                        Invalid email address
                                    </p>
                                )}

                                <div className="space-y-2" data-testid="input-password">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        placeholder="Enter your password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-destructive" data-testid="info-error">
                                        {error}
                                    </p>
                                )}

                                <Button type="submit" className="w-full" data-testid="auth-submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2" data-testid="input-email">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        value={email}
                                        placeholder="Enter your email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                                {!emailIsValid && (
                                    <p className="text-xs text-destructive" data-testid="info-error">
                                        Invalid email address
                                    </p>
                                )}

                                <div className="space-y-2" data-testid="input-password">
                                    <Label htmlFor="register-password">Password</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        value={password}
                                        placeholder="Create a password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>

                                {password && !passwordValidation.success && (
                                    <p className="whitespace-pre-line text-xs text-destructive" data-testid="info-error">
                                        {passwordValidation.error.issues.map((err) => err.message).join('\n')}
                                    </p>
                                )}

                                <div className="space-y-2" data-testid="input-repeat-password">
                                    <Label htmlFor="repeat-password">Repeat Password</Label>
                                    <Input
                                        id="repeat-password"
                                        type="password"
                                        value={repeat}
                                        placeholder="Repeat your password"
                                        onChange={(e) => setRepeat(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-destructive" data-testid="info-error">
                                        {error}
                                    </p>
                                )}

                                <Button type="submit" className="w-full" data-testid="auth-submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {isSubmitting ? 'Registering...' : 'Register'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <p className="mt-5 text-center text-sm text-muted-foreground">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            data-testid="toggle-mode"
                            className="text-primary hover:underline"
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        >
                            {mode === 'login' ? 'Register' : 'Login'}
                        </button>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
