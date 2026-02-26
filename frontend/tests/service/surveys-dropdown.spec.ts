import { test, expect } from '@playwright/test'
import { SurveyCreatorsPage } from '../page-objects/surveys'
import { setupBackendMocks } from './mocks/backend'
import { defaultObjects } from '../defults/defaultObjects'

const defaultTimeout = defaultObjects.defaultTimeout

test.describe('Survey Builder Dropdown Service Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage

  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page)
    await page.goto('/survey-builder')
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: defaultTimeout })
  })

  test('creates a dropdown question and allows changing selected value', async () => {
    await surveyCreatingPage.clickNewQuestion()
    await surveyCreatingPage.newQuestionPopup.configureDropDown({
      questionText: 'Pick your size',
      options: ['Small', 'Medium', 'Large'],
      defaultOption: 'Medium',
    })
    await surveyCreatingPage.applyPopup()

    const questionCount = await surveyCreatingPage.getQuestionCount()
    expect(questionCount).toBe(1)

    const questionCard = surveyCreatingPage.page.locator('.grid-item').first()
    const nativeSelect = questionCard.locator('select').first()

    await expect(nativeSelect).toHaveCount(1)
    await expect(nativeSelect).toHaveValue('Medium')

    await nativeSelect.selectOption({ value: 'Large' })
    await expect(nativeSelect).toHaveValue('Large')
  })
})
