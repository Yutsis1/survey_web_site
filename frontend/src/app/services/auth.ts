import { config } from "@/config"
const API_URL = config.apiUrl

export interface AuthPayload {
  email: string
  password: string
}

export async function login(payload: AuthPayload): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error('Failed to login')
  }
}

export async function register(payload: AuthPayload): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error('Failed to register')
  }
}

