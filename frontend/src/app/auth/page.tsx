'use client'

import { useState } from 'react'
import { login, register } from '../services/auth'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'register') {
        if (password !== repeat) {
          setError('Passwords do not match')
          return
        }
        await register({ email, password })
      } else {
        await login({ email, password })
      }
      alert('Success')
    } catch {
      setError('Authentication failed')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2"
          required
        />
        {mode === 'register' && (
          <input
            type="password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            placeholder="Repeat password"
            className="border p-2"
            required
          />
        )}
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="mt-4 text-sm text-blue-500 underline"
      >
        {mode === 'login'
          ? 'Need an account? Register'
          : 'Already have an account? Login'}
      </button>
    </div>
  )
}

