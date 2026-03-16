import { expect, test } from '@playwright/test'

import { defaultObjects } from '../../defults/defaultObjects'
import { AuthPage } from '../../page-objects/authPage'
import { SurveyCreatorsPage } from '../../page-objects/surveys'

const PAGE_REDIRECT_TIMEOUT = 20000
const GENERATION_TIMEOUT = 120000
const RUN_OPENAI_INTEGRATION = process.env.RUN_OPENAI_INTEGRATION === 'true'

test.describe('Survey Generation OpenAI Integration', () => {
  test.skip(!RUN_OPENAI_INTEGRATION, 'Set RUN_OPENAI_INTEGRATION=true to run real OpenAI integration test.')

  test('generates between 1 and 5 questions from prompt', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()
    await authPage.page.waitForLoadState('domcontentloaded')
    await authPage.fillLoginForm(defaultObjects.user.email, defaultObjects.user.password)

    await page.waitForURL('**/dashboard', { timeout: PAGE_REDIRECT_TIMEOUT })
    await page.locator('nav a').getByText('Builder').click()
    await page.waitForURL('**/survey-builder', { timeout: PAGE_REDIRECT_TIMEOUT })

    const surveyPage = new SurveyCreatorsPage(page)
    await surveyPage.sidebar.generatePromptTextArea.waitFor({ state: 'visible', timeout: PAGE_REDIRECT_TIMEOUT })

    await surveyPage.fillGeneratePrompt(
      'Create a customer onboarding satisfaction survey with concise questions and at most five questions.'
    )
    await surveyPage.clickGenerateSurvey()

    await expect(surveyPage.sidebar.generateSurveyButton).toHaveText('Generate Survey', {
      timeout: GENERATION_TIMEOUT,
    })

    await expect
      .poll(async () => surveyPage.getQuestionCount(), { timeout: GENERATION_TIMEOUT })
      .toBeGreaterThan(0)

    const questionCount = await surveyPage.getQuestionCount()
    expect(questionCount).toBeLessThanOrEqual(5)
    await expect(surveyPage.sidebar.surveyStatusSelect).toHaveValue('draft')
  })
})
