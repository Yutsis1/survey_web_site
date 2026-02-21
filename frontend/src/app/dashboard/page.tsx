"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card className="border-border bg-card/90">
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

  const selectedSurvey = useMemo(() => {
    if (!data || !selectedSurveyId) return data?.surveys[0] ?? null
    return data.surveys.find((survey) => survey.surveyId === selectedSurveyId) ?? data.surveys[0] ?? null
  }, [data, selectedSurveyId])

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
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!loadingData && !error && data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Surveys"
              value={String(data.summary.totalSurveys)}
              description="Number of created surveys."
            />
            <SummaryCard
              title="Total Responses"
              value={String(data.summary.totalResponses)}
              description="All submissions across surveys."
            />
            <SummaryCard
              title="Avg Completion Rate"
              value={`${data.summary.avgCompletionRate}%`}
              description="Average answered questions per submission."
            />
            <SummaryCard
              title="Active Surveys"
              value={String(data.summary.activeSurveys)}
              description="Surveys with at least one response."
            />
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
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
                        <Badge variant={survey.status === "active" ? "success" : "outline"}>
                          {survey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{survey.responsesCount}</TableCell>
                      <TableCell>{survey.createdDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
                          >
                            <Link href="/survey-builder">
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
                            <Link href={`/survey/${survey.surveyId}`} target="_blank">
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
