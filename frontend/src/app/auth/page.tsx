'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuthPage() {
    const emailSchema = z.email({ message: 'Invalid email address' })
    const passwordSchema = z
        .string()
        .min(8, { error: 'Password must be at least 8 characters long' })
        .max(20, { error: 'Password must not exceed 20 characters' })
        .refine((val) => /[A-Z]/.test(val), {
            message: 'Must contain an uppercase letter',
        })
        .refine((val) => /[a-z]/.test(val), {
            message: 'Must contain a lowercase letter',
        })
        .refine((val) => /[0-9]/.test(val), {
            message: 'Must contain a number',
        })
        .refine((val) => /[!@#$%^&*]/.test(val), {
            message: 'Must contain a special character (!@#$%^&*)',
        })

    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeat, setRepeat] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showRepeatPassword, setShowRepeatPassword] = useState(false)

    const { login, register, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

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
                    return
                }
                const emailResult = emailSchema.safeParse(email)
                if (!emailResult.success) {
                    setError('Please enter a valid email address')
                    return
                }
                const passwordResult = passwordSchema.safeParse(password)
                if (!passwordResult.success) {
                    setError(passwordResult.error.issues[0].message)
                    return
                }
                await register(email, password)
            } else {
                await login(email, password)
            }
            router.push('/dashboard')
        } catch (err) {
            console.error('Auth error:', err)
            setError(mode === 'login' ? 'Invalid email or password' : 'Registration failed. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    if (isAuthenticated) return null

    const emailError = email && !emailSchema.safeParse(email).success
    const passwordErrors = mode === 'register' && password
        ? passwordSchema.safeParse(password)
        : null

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
            {/* Background grid pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 w-full max-w-[400px]">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <span className="text-sm font-bold text-primary-foreground">SF</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-semibold text-foreground">SurveyFlow</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Create, share, and analyze surveys</p>
                    </div>
                </div>

                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <Tabs value={mode} onValueChange={(v) => { setMode(v as 'login' | 'register'); setError(null) }}>
                        <CardHeader className="pb-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login" data-testid="toggle-login">Sign In</TabsTrigger>
                                <TabsTrigger value="register" data-testid="toggle-register">Sign Up</TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <TabsContent value="login" className="mt-0">
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            data-testid="input-email"
                                            name="email"
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="login-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                data-testid="input-password"
                                                name="password"
                                                className="pr-10"
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" data-testid="info-error">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting || !email || !password}
                                        data-testid="auth-submit"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </CardContent>
                            </form>
                        </TabsContent>

                        <TabsContent value="register" className="mt-0">
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">Email</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            data-testid="input-email"
                                            name="email"
                                            className={cn(emailError && 'border-destructive')}
                                            autoComplete="email"
                                        />
                                        {emailError && (
                                            <p className="text-xs text-destructive">Please enter a valid email address</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="register-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Create a password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                data-testid="input-password"
                                                name="password"
                                                className="pr-10"
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {passwordErrors && !passwordErrors.success && (
                                            <div className="space-y-1">
                                                {passwordErrors.error.issues.map((issue, i) => (
                                                    <p key={i} className="text-xs text-muted-foreground">
                                                        <span className="text-destructive mr-1">*</span>
                                                        {issue.message}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-repeat">Confirm Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="register-repeat"
                                                type={showRepeatPassword ? 'text' : 'password'}
                                                placeholder="Confirm your password"
                                                value={repeat}
                                                onChange={(e) => setRepeat(e.target.value)}
                                                data-testid="input-repeat-password"
                                                name="repeat-password"
                                                className={cn('pr-10', repeat && password !== repeat && 'border-destructive')}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                            >
                                                {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {repeat && password !== repeat && (
                                            <p className="text-xs text-destructive">Passwords do not match</p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" data-testid="info-error">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting || !email || !password || !repeat}
                                        data-testid="auth-submit"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </CardContent>
                            </form>
                        </TabsContent>
                    </Tabs>
                </Card>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    {'By continuing, you agree to our Terms of Service'}
                </p>
            </div>
        </div>
    )
}
