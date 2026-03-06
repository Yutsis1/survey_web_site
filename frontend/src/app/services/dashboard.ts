import { fetchSurveyOptions } from "./surveys"
import { apiClient } from "./api-client"

export interface DashboardSummary {
  totalSurveys: number
  totalResponses: number
  avgCompletionRate: number
  activeSurveys: number
}

export interface SurveyChartPoint {
  date: string
  responses: number
}

export interface QuestionBreakdown {
  questionId: string
  questionText: string
  counts: Array<{ option: string; count: number }>
}

export interface DashboardSurveyAnalytics {
  surveyId: string
  title: string
  createdDate: string
  status: "published" | "draft"
  responsesCount: number
  completionRate: number
  trend: SurveyChartPoint[]
  questionBreakdown: QuestionBreakdown[]
}

export interface DashboardData {
  summary: DashboardSummary
  surveys: DashboardSurveyAnalytics[]
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

async function fetchSurveyStats(surveyId: string): Promise<DashboardSurveyAnalytics> {
  const res = await apiClient.fetch(`/surveys/${surveyId}/responses/stats`)
  if (!res.ok) throw new Error(`Failed to load stats for survey ${surveyId}`)
  return res.json()
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const options = await fetchSurveyOptions()

  const surveys = await Promise.all(
    options.map(async (surveyOption) => {
      const stats = await fetchSurveyStats(surveyOption.id)
      return stats
    })
  )

  const totalSurveys = surveys.length
  const totalResponses = surveys.reduce((sum, survey) => sum + survey.responsesCount, 0)
  const activeSurveys = surveys.filter((survey) => survey.status === "published").length
  const avgCompletionRate = surveys.length
    ? round(surveys.reduce((sum, survey) => sum + survey.completionRate, 0) / surveys.length)
    : 0

  return {
    summary: {
      totalSurveys,
      totalResponses,
      activeSurveys,
      avgCompletionRate,
    },
    surveys,
  }
}
