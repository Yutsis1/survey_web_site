import { QuestionItem } from '@/app/app-modules/questions/question-types'
import { config } from "@/config"
import { apiClient } from './api-client'

const API_URL = config.apiUrl

export interface SurveyPayload {
  title?: string
  questions: QuestionItem[]
}

export interface SurveyResponse extends SurveyPayload {
  id: string
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
