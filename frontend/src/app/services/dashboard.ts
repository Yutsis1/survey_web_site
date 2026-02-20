import { fetchSurvey, fetchSurveyOptions } from "./surveys"
import { fetchSurveyResponses, StoredSurveyResponse } from "./survey-responses"

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
  status: "active" | "draft"
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

function buildTrend(responses: StoredSurveyResponse[]): SurveyChartPoint[] {
  const grouped = responses.reduce<Record<string, number>>((acc, response) => {
    const date = new Date(response.submittedAt ?? Date.now()).toISOString().slice(0, 10)
    acc[date] = (acc[date] ?? 0) + 1
    return acc
  }, {})

  return Object.keys(grouped)
    .sort()
    .map((date) => ({ date, responses: grouped[date] }))
}

function buildQuestionBreakdown(
  responses: StoredSurveyResponse[],
  questions: Array<{ id: string; questionText: string }>
): QuestionBreakdown[] {
  return questions.map((question) => {
    const tally = new Map<string, number>()
    responses.forEach((response) => {
      const answer = response.answers.find((item) => item.questionId === question.id)
      if (!answer) return
      const key = String(answer.value)
      tally.set(key, (tally.get(key) ?? 0) + 1)
    })

    return {
      questionId: question.id,
      questionText: question.questionText,
      counts: Array.from(tally.entries()).map(([option, count]) => ({ option, count })),
    }
  })
}

function computeCompletionRate(
  responses: StoredSurveyResponse[],
  questionCount: number
) {
  if (questionCount === 0 || responses.length === 0) return 0
  const answered = responses.map((response) => response.answers.length / questionCount)
  const avg = answered.reduce((sum, value) => sum + value, 0) / answered.length
  return round(avg * 100)
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const options = await fetchSurveyOptions()

  const surveys = await Promise.all(
    options.map(async (surveyOption) => {
      const [survey, responses] = await Promise.all([
        fetchSurvey(surveyOption.id),
        fetchSurveyResponses(surveyOption.id),
      ])

      const completionRate = computeCompletionRate(responses, survey.questions.length)
      const status: "active" | "draft" = responses.length > 0 ? "active" : "draft"

      return {
        surveyId: survey.id,
        title: survey.title || "Untitled Survey",
        createdDate: new Date().toISOString().slice(0, 10),
        status,
        responsesCount: responses.length,
        completionRate,
        trend: buildTrend(responses),
        questionBreakdown: buildQuestionBreakdown(responses, survey.questions),
      } satisfies DashboardSurveyAnalytics
    })
  )

  const totalSurveys = surveys.length
  const totalResponses = surveys.reduce((sum, survey) => sum + survey.responsesCount, 0)
  const activeSurveys = surveys.filter((survey) => survey.status === "active").length
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
