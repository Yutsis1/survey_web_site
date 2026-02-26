import type { MockSurvey, MockAuthResponse } from './data'
import { getMockSurveyById, toOptions } from './data'

export type MockResponse = {
  status: number
  data: unknown
}

/**
 * MockApiServer - Encapsulates all mock API logic
 * Returns plain response data that can be adapted for different frameworks
 * (Next.js, Playwright, unit tests, etc.)
 */
export class MockApiServer {
  constructor(
    private surveys: MockSurvey[],
    private authResponse: MockAuthResponse
  ) {}

  /**
   * Handle incoming requests and return mock responses
   * Returns plain data with status code - framework agnostic
   */
  handleRequest(pathname: string, method: string): MockResponse {
    // Auth routes
    if (
      this.isAuthRoute(pathname, 'refresh') ||
      this.isAuthRoute(pathname, 'login') ||
      this.isAuthRoute(pathname, 'register')
    ) {
      return { status: 200, data: this.authResponse }
    }

    if (this.isAuthRoute(pathname, 'logout')) {
      return { status: 200, data: { ok: true } }
    }

    // Survey routes
    if (pathname.includes('/surveys/options')) {
      return { status: 200, data: toOptions(this.surveys) }
    }

    if (pathname === '/surveys' && method === 'GET') {
      return { status: 200, data: { surveys: toOptions(this.surveys) } }
    }

    // Get specific survey by ID
    if (pathname.startsWith('/surveys/') && method === 'GET') {
      return this.getSurveyResponse(pathname)
    }

    // Fallback for unmatched routes
    return { status: 404, data: { message: 'Not found' } }
  }

  /**
   * Get a specific survey response by ID
   */
  private getSurveyResponse(pathname: string): MockResponse {
    const surveyId = pathname.split('/').pop()
    if (!surveyId) {
      return { status: 404, data: { message: 'Not found' } }
    }

    const survey = getMockSurveyById(surveyId)
    if (!survey) {
      return { status: 404, data: { message: 'Not found' } }
    }

    return { status: 200, data: survey }
  }

  /**
   * Check if pathname matches an auth route
   */
  private isAuthRoute(pathname: string, route: string): boolean {
    return pathname.includes(`/auth/${route}`)
  }

  /**
   * Get all surveys
   */
  getSurveys() {
    return this.surveys
  }

  /**
   * Get survey by ID
   */
  getSurveyById(id: string) {
    return this.surveys.find((s) => s.id === id)
  }

  /**
   * Get survey options (id + title)
   */
  getSurveyOptions() {
    return toOptions(this.surveys)
  }

  /**
   * Get auth response
   */
  getAuthResponse() {
    return this.authResponse
  }
}
