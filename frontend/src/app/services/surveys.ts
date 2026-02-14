import { QuestionItem } from '@/app/app-modules/questions/question-types'
import { apiClient } from './api-client'


export interface SurveyPayload {
  title: string
  questions: QuestionItem[]
}

export interface SurveyResponse extends SurveyPayload {
  id: string
}

export interface SurveyOption {
  id: string
  title: string
}

interface SurveyListResponse {
  surveys: Array<Pick<SurveyResponse, 'id' | 'title'>>
}


export async function saveSurvey(payload: SurveyPayload): Promise<{ id: string }> {
  const res = await apiClient.fetch('/surveys', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Failed to save survey')
  return res.json()
}

export async function fetchSurvey(id: string): Promise<SurveyResponse> {
  const res = await apiClient.fetch(`/surveys/${id}`)
  if (!res.ok) throw new Error('Failed to load survey')
  return res.json()
}

export async function fetchSurveyOptions(): Promise<SurveyOption[]> {
  const optionsRes = await apiClient.fetch('/surveys/options')
  if (optionsRes.ok) {
    return optionsRes.json()
  }

  // Fallback for older backend route ordering where /surveys/options is shadowed by /surveys/{id}.
  const fallbackRes = await apiClient.fetch('/surveys')
  if (!fallbackRes.ok) throw new Error('Failed to load survey options')

  const fallbackPayload = (await fallbackRes.json()) as SurveyListResponse
  return (fallbackPayload.surveys ?? []).map((survey) => ({
    id: survey.id,
    title: survey.title ?? 'Untitled Survey',
  }))
}
