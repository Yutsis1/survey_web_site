import type { Page, Route } from '@playwright/test'

type MockSurveyOption = { id: string; title: string }

type MockSurvey = {
  id: string
  title: string
  questions: Array<{
    id: string
    questionText: string
    component: 'TextInput' | 'Checkbox' | 'RadioBar'
    option: { optionProps: Record<string, unknown> }
    layout: { i: string; x: number; y: number; w: number; h: number }
  }>
}

const DEFAULT_USER_EMAIL = 'kek@lol.com'

const mockSurveys: MockSurvey[] = [
  {
    id: 'survey-radio',
    title: 'RadioBar Survey',
    questions: [
      {
        id: 'question-radio',
        questionText: 'Pick one option',
        component: 'RadioBar',
        option: {
          optionProps: {
            name: 'mock-radio-group',
            buttons: [
              { label: 'Alpha', value: 'Alpha' },
              { label: 'Beta', value: 'Beta' },
              { label: 'Gamma', value: 'Gamma' },
            ],
            test_id: 'mock-radio',
          },
        },
        layout: { i: 'question-radio', x: 0, y: 0, w: 2, h: 2 },
      },
    ],
  },
  {
    id: 'survey-toggle',
    title: 'Toggle Survey',
    questions: [
      {
        id: 'question-toggle',
        questionText: 'Enable the feature',
        component: 'Checkbox',
        option: {
          optionProps: {
            activeLabel: 'Enabled',
            inactiveLabel: 'Disabled',
            checked: true,
            test_id: 'mock-toggle',
          },
        },
        layout: { i: 'question-toggle', x: 0, y: 0, w: 2, h: 2 },
      },
    ],
  },
  {
    id: 'survey-text',
    title: 'Text Survey',
    questions: [
      {
        id: 'question-text',
        questionText: 'Your name',
        component: 'TextInput',
        option: {
          optionProps: {
            label: 'Full name',
            placeholder: 'Jane Doe',
            test_id: 'mock-text',
          },
        },
        layout: { i: 'question-text', x: 0, y: 0, w: 2, h: 2 },
      },
    ],
  },
]

function toOptions(surveys: MockSurvey[]): MockSurveyOption[] {
  return surveys.map((survey) => ({ id: survey.id, title: survey.title }))
}

function createJsonResponse(route: Route, payload: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  })
}

export async function setupBackendMocks(page: Page) {
  await page.route('**/api/proxy/auth/refresh', async (route) => {
    return createJsonResponse(route, {
      access_token: 'mock-access-token',
      expires_in: 900,
      token_type: 'bearer',
      email: DEFAULT_USER_EMAIL,
    })
  })

  await page.route('**/api/proxy/auth/login', async (route) => {
    return createJsonResponse(route, {
      access_token: 'mock-access-token',
      expires_in: 900,
      token_type: 'bearer',
      email: DEFAULT_USER_EMAIL,
    })
  })

  await page.route('**/api/proxy/auth/register', async (route) => {
    return createJsonResponse(route, {
      access_token: 'mock-access-token',
      expires_in: 900,
      token_type: 'bearer',
      email: DEFAULT_USER_EMAIL,
    })
  })

  await page.route('**/api/proxy/auth/logout', async (route) => {
    return createJsonResponse(route, { ok: true })
  })

  await page.route('**/api/proxy/surveys/options', async (route) => {
    return createJsonResponse(route, toOptions(mockSurveys))
  })

  await page.route('**/api/proxy/surveys', async (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    return createJsonResponse(route, { surveys: toOptions(mockSurveys) })
  })

  await page.route('**/api/proxy/surveys/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/surveys/options')) {
      return route.fallback()
    }
    const surveyId = url.pathname.split('/').pop() ?? ''
    const survey = mockSurveys.find((item) => item.id === surveyId)
    if (!survey) {
      return createJsonResponse(route, { message: 'Not found' }, 404)
    }
    return createJsonResponse(route, survey)
  })
}
