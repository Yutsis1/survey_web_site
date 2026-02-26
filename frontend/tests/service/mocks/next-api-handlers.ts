import { NextRequest, NextResponse } from 'next/server'
import { mockSurveys, toOptions, createMockAuthResponse, getMockSurveyById } from './data'

/**
 * Handlers for Next.js dynamic API routes to serve mock data in dev:stub mode
 * Use these in: src/app/api/proxy/[...route].ts
 *
 * Example usage:
 * export async function GET(request: NextRequest, { params }: Params) {
 *   return handleProxyRequest(request, params.route)
 * }
 * export async function POST(request: NextRequest, { params }: Params) {
 *   return handleProxyRequest(request, params.route, request)
 * }
 */

type RouteSegments = string[]

async function handleProxyRequest(
  request: NextRequest,
  route: RouteSegments,
  body?: NextRequest
): Promise<NextResponse> {
  const pathname = `/${route.join('/')}`
  const method = request.method

  // Auth routes
  if (pathname.includes('/auth/refresh') || pathname.includes('/auth/login') || pathname.includes('/auth/register')) {
    return NextResponse.json(createMockAuthResponse())
  }

  if (pathname.includes('/auth/logout')) {
    return NextResponse.json({ ok: true })
  }

  // Survey routes
  if (pathname.includes('/surveys/options')) {
    return NextResponse.json(toOptions(mockSurveys))
  }

  if (pathname === '/surveys' && method === 'GET') {
    return NextResponse.json({ surveys: toOptions(mockSurveys) })
  }

  // Get specific survey by ID
  if (pathname.startsWith('/surveys/') && method === 'GET') {
    const surveyId = pathname.split('/').pop()
    const survey = surveyId ? getMockSurveyById(surveyId) : undefined
    if (!survey) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(survey)
  }

  // Fallback for unmatched routes
  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}

export { handleProxyRequest }
