import { test, expect } from '@playwright/test'
import { SurveyCreatorsPage } from '../page-objects/surveys'
import { setupBackendMocks } from './mocks/backend'

const SURVEYS = [
  { id: 'survey-radio', testId: 'mock-radio' },
  { id: 'survey-toggle', testId: 'mock-toggle' },
  { id: 'survey-text', testId: 'mock-text' },
]

test.describe('Survey Builder Service Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage

  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page)
    await page.goto('/survey-builder')
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: 15000 })
  })

  test('loads mocked surveys with each question type', async () => {
    for (const survey of SURVEYS) {
      await test.step(`Load ${survey.id}`, async () => {
        await surveyCreatingPage.clickLoadSurvey()
        await surveyCreatingPage.loadSurveyPopup.dropdown.waitFor({ state: 'visible', timeout: 15000 })
        await surveyCreatingPage.loadSurveyPopup.waitForSurveysToLoad()
        await surveyCreatingPage.loadSurveyPopup.selectSurveyById(survey.id)
        await surveyCreatingPage.applyPopup()

        await expect(surveyCreatingPage.page.getByTestId(survey.testId)).toBeVisible()
        const questionCount = await surveyCreatingPage.getQuestionCount()
        expect(questionCount).toBe(1)
      })
    }
  })
})
