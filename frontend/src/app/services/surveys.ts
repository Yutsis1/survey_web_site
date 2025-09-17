import { QuestionItem } from '@/app/app-modules/questions/question-types'
import { config } from "@/config"

const API_URL = config.apiUrl

export interface SurveyPayload {
  title?: string
  questions: QuestionItem[]
}

export interface SurveyResponse extends SurveyPayload {
  id: string
}

async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshResponse.ok) {
      // Retry the original request
      return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
    } else {
      // Refresh failed, redirect to auth
      window.location.href = '/auth'
      throw new Error('Authentication required')
    }
  }

  return response
}

export async function saveSurvey(payload: SurveyPayload): Promise<{ id: string }> {
  const res = await authenticatedFetch(`${API_URL}/surveys`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Failed to save survey')
  }
  return res.json()
}

export async function fetchSurvey(id: string): Promise<SurveyResponse> {
  const res = await authenticatedFetch(`${API_URL}/surveys/${id}`)

  if (!res.ok) {
    throw new Error('Failed to load survey')
  }
  return res.json()
}
