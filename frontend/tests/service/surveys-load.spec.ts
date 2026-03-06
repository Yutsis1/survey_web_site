import { test, expect } from '@playwright/test'
import { SurveyCreatorsPage } from '../page-objects/surveys'
import { setupBackendMocks } from './mocks/backend'
import { defaultObjects } from '../defults/defaultObjects'

const SURVEYS = [
  { id: 'survey-radio', testId: 'mock-radio' },
  { id: 'survey-toggle', testId: 'mock-toggle' },
  { id: 'survey-text', testId: 'mock-text' },
  { id: 'survey-dropdown', testId: 'mock-dropdown' },
  { id: 'survey-checkbox-tiles', testId: 'mock-checkbox-tiles' },
]

const defaultTimeout = defaultObjects.defaultTimeout

test.describe('Survey Builder Service Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage

  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page)
    await page.goto('/survey-builder')
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: defaultTimeout })
  })

  test('loads mocked surveys with each question type', async () => {
    for (const survey of SURVEYS) {
      await test.step(`Load ${survey.id}`, async () => {
        await surveyCreatingPage.clickLoadSurvey()
        await surveyCreatingPage.loadSurveyPopup.dropdown.waitFor({ state: 'visible', timeout: defaultTimeout })
        await surveyCreatingPage.loadSurveyPopup.waitForSurveysToLoad()
        await surveyCreatingPage.loadSurveyPopup.selectSurveyById(survey.id)
        await surveyCreatingPage.applyPopup()

        await expect(surveyCreatingPage.page.getByTestId(survey.testId)).toBeVisible()
        const questionCount = await surveyCreatingPage.getQuestionCount()
        expect(questionCount).toBe(1)
      })
    }
  })

  test('uses persisted layout coordinates when loading survey', async () => {
    await surveyCreatingPage.clickLoadSurvey()
    await surveyCreatingPage.loadSurveyPopup.dropdown.waitFor({ state: 'visible', timeout: defaultTimeout })
    await surveyCreatingPage.loadSurveyPopup.waitForSurveysToLoad()
    await surveyCreatingPage.loadSurveyPopup.selectSurveyById('survey-radio')
    await surveyCreatingPage.applyPopup()

    const questionCard = surveyCreatingPage.page.locator('.grid-item').first()
    await expect(questionCard).toBeVisible()

    const [questionBox, containerBox] = await Promise.all([
      questionCard.boundingBox(),
      surveyCreatingPage.gridContainer.boundingBox(),
    ])

    expect(questionBox).not.toBeNull()
    expect(containerBox).not.toBeNull()
    expect(questionBox!.y).toBeGreaterThan(containerBox!.y + 120)
  })
})
