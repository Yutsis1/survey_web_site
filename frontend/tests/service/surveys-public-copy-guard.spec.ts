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

  test("shows toast when copying public survey before first save", async ({ page }) => {
    await surveyCreatingPage.clickCopyPublicSurvey()
    
    // Wait for toast to appear
    await surveyCreatingPage.toast.waitForToast('info')
    
    // Verify toast message
    const toastTitle = await surveyCreatingPage.toast.getToastTitle('info')
    expect(toastTitle).toBe("Survey isn't saved. Please save it first.")
  })
})
