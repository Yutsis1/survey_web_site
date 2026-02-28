export type MockSurveyOption = { id: string; title: string }

export type MockSurvey = {
  id: string
  title: string
  questions: Array<{
    id: string
    questionText: string
    component: 'TextInput' | 'Switch' | 'RadioBar' | 'DropDown' | 'CheckboxTiles'
    option: { optionProps: Record<string, unknown> }
    layout: { i: string; x: number; y: number; w: number; h: number }
  }>
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
  {
    id: 'survey-dropdown',
    title: 'Dropdown Survey',
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
  },
  {
    id: 'survey-checkbox-tiles',
    title: 'Checkbox Tiles Survey',
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
  },
]

export const DEFAULT_SURVEY_ID = mockSurveys[0]?.id ?? 'survey-radio'

export function getMockSurveyById(id: string): MockSurvey | undefined {
  return mockSurveys.find((survey) => survey.id === id)
}

export function toOptions(surveys: MockSurvey[]): MockSurveyOption[] {
  return surveys.map((survey) => ({ id: survey.id, title: survey.title }))
}

export function createMockAuthResponse(): MockAuthResponse {
  return {
    access_token: 'mock-access-token',
    expires_in: 900,
    token_type: 'bearer',
    email: DEFAULT_USER_EMAIL,
  }
}
