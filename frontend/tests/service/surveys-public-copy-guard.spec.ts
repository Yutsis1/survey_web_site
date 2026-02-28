import { test, expect } from '@playwright/test'
import { SurveyCreatorsPage } from '../page-objects/surveys'
import { setupBackendMocks } from './mocks/backend'
import { defaultObjects } from '../defults/defaultObjects'

const defaultTimeout = defaultObjects.defaultTimeout

test.describe('Survey Public Copy Guard Service Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage

  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page)
    await page.goto('/survey-builder')
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: defaultTimeout })
  })

  test("shows popup when copying public survey before first save", async ({ page }) => {
    let dialogMessage = ''
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.accept()
    })

    await surveyCreatingPage.clickCopyPublicSurvey()
    expect(dialogMessage).toBe("survey isn't saved. please save it")
  })
})
