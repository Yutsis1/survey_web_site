import type { Page, Route } from '@playwright/test'
import { mockSurveys, createMockAuthResponse } from './data'
import { MockApiServer } from './server'

const mockServer = new MockApiServer(mockSurveys, createMockAuthResponse())

function createJsonResponse(route: Route, payload: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  })
}

export async function setupBackendMocks(page: Page) {
  await page.route('**/api/proxy/**', async (route) => {
    const url = new URL(route.request().url())
    const pathname = url.pathname.replace('/api/proxy', '')
    const method = route.request().method()

    const response = mockServer.handleRequest(pathname, method)
    return createJsonResponse(route, response.data, response.status)
  })
}

