"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

import { DynamicComponentRenderer } from "@/app/components/dynamic-component-renderer"
import { QuestionItem } from "@/app/app-modules/questions/question-types"
import {
  fetchPublicSurveyById,
  submitSurveyResponse,
} from "@/app/services/survey-responses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type AnswerValue = string | boolean

interface SurveyData {
  id: string
  title: string
  questions: QuestionItem[]
}

export default function SurveyResponsePage() {
  const params = useParams<{ id: string }>()
  const surveyId = params?.id

  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!surveyId) return

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchPublicSurveyById(surveyId)
        setSurvey(data)

        const initialAnswers: Record<string, AnswerValue> = {}
        data.questions.forEach((question) => {
          const optionProps = question.option?.optionProps as Record<string, unknown> | undefined
          if (!optionProps) return
          if (question.component === "Checkbox") {
            initialAnswers[question.id] = Boolean(optionProps.checked)
          } else if (question.component === "TextInput") {
            initialAnswers[question.id] = String(optionProps.value ?? "")
          } else if (question.component === "RadioBar") {
            initialAnswers[question.id] = String(optionProps.selectedValue ?? "")
          }
        })
        setAnswers(initialAnswers)
      } catch (requestError) {
        console.error(requestError)
        setError("Survey not found or unavailable.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [surveyId])

  const totalQuestions = survey?.questions.length ?? 0
  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((value) => {
      if (typeof value === "boolean") return true
      return String(value).trim().length > 0
    }).length
  }, [answers])

  const progressValue = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const getQuestionOption = (question: QuestionItem) => {
    const optionProps = (question.option?.optionProps ?? {}) as Record<string, unknown>
    if (question.component === "TextInput") {
      return {
        optionProps: {
          ...optionProps,
          value: String(answers[question.id] ?? ""),
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setAnswers((prev) => ({ ...prev, [question.id]: e.target.value })),
        },
      }
    }

    if (question.component === "Checkbox") {
      return {
        optionProps: {
          ...optionProps,
          checked: Boolean(answers[question.id]),
          onChange: (value: boolean) =>
            setAnswers((prev) => ({ ...prev, [question.id]: value })),
        },
      }
    }

    if (question.component === "RadioBar") {
      return {
        optionProps: {
          ...optionProps,
          selectedValue: String(answers[question.id] ?? ""),
          onChange: (value: string) =>
            setAnswers((prev) => ({ ...prev, [question.id]: value })),
        },
      }
    }

    return { optionProps }
  }

  const handleSubmit = async () => {
    if (!surveyId || !survey) return
    setSubmitting(true)
    setError(null)

    try {
      await submitSurveyResponse({
        surveyId,
        answers: survey.questions.map((question) => ({
          questionId: question.id,
          value: answers[question.id] ?? "",
        })),
      })
      setSubmitted(true)
    } catch (submitError) {
      console.error(submitError)
      setError("Failed to submit responses. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading survey...
        </div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Unable to load survey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg border-success/40">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <h1 className="text-xl font-semibold">Thank you for your response</h1>
            <p className="text-sm text-muted-foreground">
              Your feedback has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="mb-6 border-border bg-card/90">
        <CardHeader>
          <CardTitle>{survey?.title || "Untitled Survey"}</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {answeredCount} / {totalQuestions} answered
              </span>
            </div>
            <Progress value={progressValue} />
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {survey?.questions.map((question, index) => (
          <Card key={question.id} className="border-border bg-[#111111]">
            <CardContent className="p-5">
              <div className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                Question {index + 1}
              </div>
              <DynamicComponentRenderer
                component={question.component}
                option={getQuestionOption(question)}
                questionText={question.questionText}
                showQuestionText
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Submitting..." : "Submit Response"}
        </Button>
      </div>
    </div>
  )
}
