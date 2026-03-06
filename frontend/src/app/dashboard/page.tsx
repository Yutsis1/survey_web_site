"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { BarChart3, Copy, ExternalLink, FilePenLine, Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { useAuth } from "@/app/contexts/auth-context"
import { fetchDashboardData, DashboardData } from "@/app/services/dashboard"
import { fetchLatestSurveyResponse, StoredSurveyResponse } from "@/app/services/survey-responses"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatAnswerValue(value: string | boolean | string[]) {
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return value
}

function SummaryCard({
  title,
  value,
  description,
  testId,
}: {
  title: string
  value: string
  description: string
  testId?: string
}) {
  return (
    <Card className="border-border bg-card/90" data-testid={testId}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null)
  const [latestResponsesBySurveyId, setLatestResponsesBySurveyId] = useState<Record<string, StoredSurveyResponse | null>>({})
  const [latestResponseLoadingBySurveyId, setLatestResponseLoadingBySurveyId] = useState<Record<string, boolean>>({})
  const [latestResponseErrorBySurveyId, setLatestResponseErrorBySurveyId] = useState<Record<string, string | null>>({})
  const latestResponseInFlightRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return

    const run = async () => {
      setLoadingData(true)
      setError(null)
      setLatestResponsesBySurveyId({})
      setLatestResponseLoadingBySurveyId({})
      setLatestResponseErrorBySurveyId({})
      latestResponseInFlightRef.current.clear()
      try {
        const dashboardData = await fetchDashboardData()
        setData(dashboardData)
        setSelectedSurveyId(dashboardData.surveys[0]?.surveyId ?? null)
      } catch (requestError) {
        console.error(requestError)
        setError("Failed to load dashboard data.")
      } finally {
        setLoadingData(false)
      }
    }

    run()
  }, [isAuthenticated])

  useEffect(() => {
    if (!selectedSurveyId) return
    if (Object.prototype.hasOwnProperty.call(latestResponsesBySurveyId, selectedSurveyId)) return
    if (latestResponseInFlightRef.current.has(selectedSurveyId)) return

    latestResponseInFlightRef.current.add(selectedSurveyId)
    setLatestResponseLoadingBySurveyId((current) => ({ ...current, [selectedSurveyId]: true }))
    setLatestResponseErrorBySurveyId((current) => ({ ...current, [selectedSurveyId]: null }))

    const loadLatestResponse = async () => {
      try {
        const latestResponse = await fetchLatestSurveyResponse(selectedSurveyId)
        setLatestResponsesBySurveyId((current) => ({ ...current, [selectedSurveyId]: latestResponse }))
      } catch (requestError) {
        console.error(requestError)
        setLatestResponsesBySurveyId((current) => ({ ...current, [selectedSurveyId]: null }))
        setLatestResponseErrorBySurveyId((current) => ({
          ...current,
          [selectedSurveyId]: "Failed to load latest response.",
        }))
      } finally {
        latestResponseInFlightRef.current.delete(selectedSurveyId)
        setLatestResponseLoadingBySurveyId((current) => ({ ...current, [selectedSurveyId]: false }))
      }
    }

    loadLatestResponse()
  }, [selectedSurveyId, latestResponsesBySurveyId])

  const selectedSurvey = useMemo(() => {
    if (!data || !selectedSurveyId) return data?.surveys[0] ?? null
    return data.surveys.find((survey) => survey.surveyId === selectedSurveyId) ?? data.surveys[0] ?? null
  }, [data, selectedSurveyId])
  const selectedLatestResponse = selectedSurveyId ? latestResponsesBySurveyId[selectedSurveyId] ?? null : null
  const selectedLatestResponseError = selectedSurveyId ? latestResponseErrorBySurveyId[selectedSurveyId] : null
  const hasLoadedLatestResponse = selectedSurveyId
    ? Object.prototype.hasOwnProperty.call(latestResponsesBySurveyId, selectedSurveyId)
    : false
  const isLoadingLatestResponse = selectedSurveyId
    ? !hasLoadedLatestResponse || Boolean(latestResponseLoadingBySurveyId[selectedSurveyId])
    : false

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor survey activity, completion, and response trends.
        </p>
      </div>

      {loadingData ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-72" />
          <Skeleton className="h-80" />
        </div>
      ) : null}

      {!loadingData && error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive" data-testid="dashboard-error">{error}</CardContent>
        </Card>
      )}

      {!loadingData && !error && data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Surveys"
              value={String(data.summary.totalSurveys)}
              description="Number of created surveys."
              testId="summary-card-total-surveys"
            />
            <SummaryCard
              title="Total Responses"
              value={String(data.summary.totalResponses)}
              description="All submissions across surveys."
              testId="summary-card-total-responses"
            />
            <SummaryCard
              title="Avg Completion Rate"
              value={`${data.summary.avgCompletionRate}%`}
              description="Average answered questions per submission."
              testId="summary-card-avg-completion-rate"
            />
            <SummaryCard
              title="Published Surveys"
              value={String(data.summary.activeSurveys)}
              description="Surveys visible to responders."
              testId="summary-card-active-surveys"
            />
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-testid="surveys-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.surveys.map((survey) => (
                    <TableRow
                      key={survey.surveyId}
                      onClick={() => setSelectedSurveyId(survey.surveyId)}
                      className="cursor-pointer"
                      data-state={selectedSurveyId === survey.surveyId ? "selected" : undefined}
                    >
                      <TableCell className="font-medium">{survey.title}</TableCell>
                      <TableCell>
                        <Badge variant={survey.status === "published" ? "success" : "outline"} data-testid="survey-status-badge">
                          {survey.status}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid="survey-responses-count">{survey.responsesCount}</TableCell>
                      <TableCell>{survey.createdDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
                          >
                            <Link href={`/survey-builder/${survey.surveyId}`}>
                              <FilePenLine className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event: MouseEvent<HTMLElement>) => {
                              event.stopPropagation()
                              const url = `${window.location.origin}/survey/${survey.surveyId}`
                              navigator.clipboard.writeText(url)
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Share
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
                          >
                            <Link href={`/survey/${survey.surveyId}?preview=1`} target="_blank">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedSurvey && (
            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="inline-flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Response Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      responses: {
                        label: "Responses",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedSurvey.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          dataKey="responses"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-1))", r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-semibold">{selectedSurvey.completionRate}%</div>
                  <Progress value={selectedSurvey.completionRate} />
                  <p className="text-xs text-muted-foreground">
                    Average completion based on answered questions per response.
                  </p>
                </CardContent>
              </Card>

              <Card className="xl:col-span-3" data-testid="latest-response-preview">
                <CardHeader>
                  <CardTitle>Latest Response Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingLatestResponse ? (
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading latest response...
                    </div>
                  ) : selectedLatestResponseError ? (
                    <p className="text-sm text-destructive">{selectedLatestResponseError}</p>
                  ) : selectedLatestResponse ? (
                    <>
                      <div className="text-xs text-muted-foreground">
                        Response ID: {selectedLatestResponse.id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Submitted: {new Date(selectedLatestResponse.submittedAt ?? "").toLocaleString()}
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        {selectedLatestResponse.answers.map((answer) => {
                          const question = selectedSurvey.questionBreakdown.find(
                            (item) => item.questionId === answer.questionId
                          )
                          return (
                            <div key={answer.questionId} className="rounded-md border border-border p-3">
                              <div className="text-sm font-medium">
                                {question?.questionText ?? answer.questionId}
                              </div>
                              <div className="text-sm text-muted-foreground" data-testid={`latest-answer-${answer.questionId}`}>
                                {formatAnswerValue(answer.value)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No responses yet.</p>
                  )}
                </CardContent>
              </Card>

              {selectedSurvey.questionBreakdown.map((question) => (
                <Card key={question.questionId} className="xl:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base">{question.questionText}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={Object.fromEntries(
                        question.counts.map((entry, index) => [
                          entry.option,
                          {
                            label: entry.option,
                            color: `hsl(var(--chart-${(index % 5) + 1}))`,
                          },
                        ])
                      )}
                      className="h-[220px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={question.counts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="option" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
