import { config } from "@/config"
import { SurveyResponse } from "./surveys"

export interface SurveyAnswer {
  questionId: string
  value: string | boolean
}

export interface SubmitSurveyResponsePayload {
  surveyId: string
  answers: SurveyAnswer[]
  submittedAt?: string
}

export interface StoredSurveyResponse extends SubmitSurveyResponsePayload {
  id: string
}

const localResponsesKey = "surveyflow:responses"

function readLocalResponses(): StoredSurveyResponse[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(localResponsesKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredSurveyResponse[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalResponses(responses: StoredSurveyResponse[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(localResponsesKey, JSON.stringify(responses))
}

export async function fetchPublicSurveyById(id: string): Promise<SurveyResponse> {
  const res = await fetch(`${config.apiUrl}/surveys/${id}`, {
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

  try {
    const res = await fetch(`${config.apiUrl}/surveys/${payload.surveyId}/responses`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (res.ok) return res.json()

    if (res.status !== 404 && res.status !== 405 && res.status !== 501) {
      throw new Error(`Failed to submit survey response: ${res.status}`)
    }
  } catch (error) {
    console.warn("submitSurveyResponse endpoint unavailable, falling back to local storage.", error)
  }

  const localResponses = readLocalResponses()
  const id = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
  localResponses.push({ id, ...body })
  writeLocalResponses(localResponses)
  return { id }
}

export async function fetchSurveyResponses(surveyId: string): Promise<StoredSurveyResponse[]> {
  try {
    const res = await fetch(`${config.apiUrl}/surveys/${surveyId}/responses`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (res.ok) return res.json()
    if (res.status !== 404 && res.status !== 405 && res.status !== 501) {
      throw new Error(`Failed to fetch survey responses: ${res.status}`)
    }
  } catch (error) {
    console.warn("fetchSurveyResponses endpoint unavailable, using local storage fallback.", error)
  }

  return readLocalResponses().filter((item) => item.surveyId === surveyId)
}
