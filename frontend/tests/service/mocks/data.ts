export type MockSurveyOption = { id: string; title: string; status: 'draft' | 'published' }

export type MockSurvey = {
  id: string
  title: string
  status: 'draft' | 'published'
  questions: Array<{
    id: string
    questionText: string
    component: 'TextInput' | 'Switch' | 'RadioBar' | 'DropDown' | 'CheckboxTiles'
    option: { optionProps: Record<string, unknown> }
    layout: { i: string; x: number; y: number; w: number; h: number }
  }>
  layouts: {
    lg: Array<{ i: string; x: number; y: number; w: number; h: number }>
    md: Array<{ i: string; x: number; y: number; w: number; h: number }>
    sm: Array<{ i: string; x: number; y: number; w: number; h: number }>
    xs: Array<{ i: string; x: number; y: number; w: number; h: number }>
    xxs: Array<{ i: string; x: number; y: number; w: number; h: number }>
  }
}

export type MockAuthResponse = {
  access_token: string
  expires_in: number
  token_type: string
  email: string
}

export const DEFAULT_USER_EMAIL = 'kek@lol.com'

export const mockSurveys: MockSurvey[] = [
  {
    id: 'survey-radio',
    title: 'RadioBar Survey',
    status: 'published',
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
    layouts: {
      lg: [{ i: 'question-radio', x: 4, y: 3, w: 4, h: 2 }],
      md: [{ i: 'question-radio', x: 2, y: 3, w: 4, h: 2 }],
      sm: [{ i: 'question-radio', x: 0, y: 3, w: 4, h: 2 }],
      xs: [{ i: 'question-radio', x: 0, y: 3, w: 4, h: 2 }],
      xxs: [{ i: 'question-radio', x: 0, y: 3, w: 2, h: 2 }],
    },
  },
  {
    id: 'survey-toggle',
    title: 'Toggle Survey',
    status: 'draft',
    questions: [
      {
        id: 'question-toggle',
        questionText: 'Enable the feature',
        component: 'Switch',
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
    layouts: {
      lg: [{ i: 'question-toggle', x: 0, y: 0, w: 2, h: 2 }],
      md: [{ i: 'question-toggle', x: 0, y: 0, w: 2, h: 2 }],
      sm: [{ i: 'question-toggle', x: 0, y: 0, w: 2, h: 2 }],
      xs: [{ i: 'question-toggle', x: 0, y: 0, w: 2, h: 2 }],
      xxs: [{ i: 'question-toggle', x: 0, y: 0, w: 2, h: 2 }],
    },
  },
  {
    id: 'survey-text',
    title: 'Text Survey',
    status: 'draft',
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
    layouts: {
      lg: [{ i: 'question-text', x: 0, y: 0, w: 3, h: 3 }],
      md: [{ i: 'question-text', x: 0, y: 0, w: 3, h: 3 }],
      sm: [{ i: 'question-text', x: 0, y: 0, w: 3, h: 3 }],
      xs: [{ i: 'question-text', x: 0, y: 0, w: 3, h: 3 }],
      xxs: [{ i: 'question-text', x: 0, y: 0, w: 2, h: 3 }],
    },
  },
  {
    id: 'survey-dropdown',
    title: 'Dropdown Survey',
    status: 'published',
    questions: [
      {
        id: 'question-dropdown',
        questionText: 'Pick your size',
        component: 'DropDown',
        option: {
          optionProps: {
            label: 'Size',
            selectedOption: 'Medium',
            options: [
              { label: 'Small', value: 'Small' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Large', value: 'Large' },
            ],
            test_id: 'mock-dropdown',
          },
        },
        layout: { i: 'question-dropdown', x: 0, y: 0, w: 2, h: 2 },
      },
    ],
    layouts: {
      lg: [{ i: 'question-dropdown', x: 0, y: 1, w: 3, h: 2 }],
      md: [{ i: 'question-dropdown', x: 0, y: 1, w: 3, h: 2 }],
      sm: [{ i: 'question-dropdown', x: 0, y: 1, w: 3, h: 2 }],
      xs: [{ i: 'question-dropdown', x: 0, y: 1, w: 3, h: 2 }],
      xxs: [{ i: 'question-dropdown', x: 0, y: 1, w: 2, h: 2 }],
    },
  },
  {
    id: 'survey-checkbox-tiles',
    title: 'Checkbox Tiles Survey',
    status: 'draft',
    questions: [
      {
        id: 'question-checkbox-tiles',
        questionText: 'Select your preferences',
        component: 'CheckboxTiles',
        option: {
          optionProps: {
            name: 'preferences',
            buttons: [
              { label: 'Option A', value: 'option-a' },
              { label: 'Option B', value: 'option-b' },
              { label: 'Option C', value: 'option-c' },
              { label: 'Option D', value: 'option-d' },
            ],
            selectedValues: ['option-a'],
            test_id: 'mock-checkbox-tiles',
          },
        },
        layout: { i: 'question-checkbox-tiles', x: 0, y: 0, w: 2, h: 3 },
      },
    ],
    layouts: {
      lg: [{ i: 'question-checkbox-tiles', x: 6, y: 0, w: 4, h: 3 }],
      md: [{ i: 'question-checkbox-tiles', x: 4, y: 0, w: 4, h: 3 }],
      sm: [{ i: 'question-checkbox-tiles', x: 0, y: 0, w: 4, h: 3 }],
      xs: [{ i: 'question-checkbox-tiles', x: 0, y: 0, w: 4, h: 3 }],
      xxs: [{ i: 'question-checkbox-tiles', x: 0, y: 0, w: 2, h: 3 }],
    },
  },
]

export const DEFAULT_SURVEY_ID = mockSurveys[0]?.id ?? 'survey-radio'

export function getMockSurveyById(id: string): MockSurvey | undefined {
  return mockSurveys.find((survey) => survey.id === id)
}

export function toOptions(surveys: MockSurvey[]): MockSurveyOption[] {
  return surveys.map((survey) => ({ id: survey.id, title: survey.title, status: survey.status }))
}

export function createMockAuthResponse(): MockAuthResponse {
  return {
    access_token: 'mock-access-token',
    expires_in: 900,
    token_type: 'bearer',
    email: DEFAULT_USER_EMAIL,
  }
}

export type MockSurveyStats = {
  surveyId: string
  title: string
  status: 'draft' | 'published'
  createdDate: string
  responsesCount: number
  completionRate: number
  trend: Array<{ date: string; responses: number }>
  questionBreakdown: Array<{
    questionId: string
    questionText: string
    counts: Array<{ option: string; count: number }>
  }>
}

export function createMockStatsForSurvey(survey: MockSurvey): MockSurveyStats {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().slice(0, 10)

  // Generate mock question breakdown based on survey questions
  const questionBreakdown = survey.questions.map((question) => {
    let counts: Array<{ option: string; count: number }> = []

    // Generate realistic counts based on question type
    if (question.component === 'RadioBar') {
      const buttons = (question.option.optionProps as any).buttons || []
      counts = buttons.map((btn: any, idx: number) => ({
        option: btn.label,
        count: 10 - idx * 2, // Decreasing counts
      }))
    } else if (question.component === 'Switch') {
      counts = [
        { option: 'Yes', count: 15 },
        { option: 'No', count: 8 },
      ]
    } else if (question.component === 'DropDown') {
      const options = (question.option.optionProps as any).options || []
      counts = options.map((opt: any, idx: number) => ({
        option: opt.label,
        count: 7 - idx,
      }))
    } else if (question.component === 'CheckboxTiles') {
      const buttons = (question.option.optionProps as any).buttons || []
      counts = buttons.map((btn: any, idx: number) => ({
        option: btn.label,
        count: 5 + idx,
      }))
    } else {
      counts = [
        { option: 'Sample Answer 1', count: 12 },
        { option: 'Sample Answer 2', count: 8 },
      ]
    }

    return {
      questionId: question.id,
      questionText: question.questionText,
      counts,
    }
  })

  return {
    surveyId: survey.id,
    title: survey.title,
    status: survey.status,
    createdDate: twoDaysAgo,
    responsesCount: 23,
    completionRate: 87.5,
    trend: [
      { date: twoDaysAgo, responses: 5 },
      { date: yesterday, responses: 10 },
      { date: today, responses: 8 },
    ],
    questionBreakdown,
  }
}
