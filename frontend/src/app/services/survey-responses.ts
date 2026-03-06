import { config } from "@/config"
import { SurveyResponse } from "./surveys"
import { apiClient } from "./api-client"

export interface SurveyAnswer {
  questionId: string
  value: string | boolean | string[]
}

export interface SubmitSurveyResponsePayload {
  surveyId: string
  answers: SurveyAnswer[]
  submittedAt?: string
}

export interface StoredSurveyResponse extends SubmitSurveyResponsePayload {
  id: string
}

export async function fetchPublicSurveyById(id: string): Promise<SurveyResponse> {
  const res = await fetch(`${config.apiUrl}/surveys/public/${id}`, {
    method: "GET",
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error(`Failed to load survey: ${res.status}`)
  }

  return res.json()
}

export async function submitSurveyResponse(
  payload: SubmitSurveyResponsePayload
): Promise<{ id: string }> {
  const body = {
    ...payload,
    submittedAt: payload.submittedAt ?? new Date().toISOString(),
  }

  const res = await fetch(`${config.apiUrl}/surveys/${payload.surveyId}/responses`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Failed to submit survey response: ${res.status}`)
  }

  return res.json()
}

export async function fetchLatestSurveyResponse(surveyId: string): Promise<StoredSurveyResponse | null> {
  const res = await apiClient.fetch(`/surveys/${surveyId}/responses/latest`, {
    method: "GET",
  })

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Failed to fetch latest response: ${res.status}`)
  }

  return res.json()
}

export async function fetchSurveyResponseById(
  surveyId: string,
  responseId: string
): Promise<StoredSurveyResponse> {
  const res = await apiClient.fetch(`/surveys/${surveyId}/responses/${responseId}`, {
    method: "GET",
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch response: ${res.status}`)
  }

  return res.json()
}
