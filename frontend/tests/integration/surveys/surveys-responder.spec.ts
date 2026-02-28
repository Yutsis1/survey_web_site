import { test, expect, Page } from '@playwright/test'
import { AuthPage } from '../../page-objects/authPage'
import { SurveyCreatorsPage } from '../../page-objects/surveys'
import { defaultObjects } from '../../defults/defaultObjects'

const PAGE_REDIRECT_TIMEOUT = 20000

async function loadPublishedDemoSurvey(page: Page): Promise<string> {
  const surveyCreatingPage = new SurveyCreatorsPage(page)
  await surveyCreatingPage.page.waitForLoadState('domcontentloaded')
  await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: PAGE_REDIRECT_TIMEOUT })

  await surveyCreatingPage.clickLoadSurvey()
  await surveyCreatingPage.loadSurveyPopup.dropdown.waitFor({ state: 'visible', timeout: PAGE_REDIRECT_TIMEOUT })
  await surveyCreatingPage.loadSurveyPopup.waitForSurveysToLoad()

  const options = surveyCreatingPage.loadSurveyPopup.dropdown.locator('option:not([value=""])')
  const optionsCount = await options.count()
  let publishedSurveyId = ''

  for (let index = 0; index < optionsCount; index += 1) {
    const option = options.nth(index)
    const optionText = (await option.textContent()) ?? ''
    if (optionText.includes('Published Demo Survey')) {
      publishedSurveyId = (await option.getAttribute('value')) ?? ''
      break
    }
  }

  expect(publishedSurveyId).not.toBe('')
  await surveyCreatingPage.loadSurveyPopup.selectSurveyById(publishedSurveyId)
  await surveyCreatingPage.applyPopup()
  await expect(surveyCreatingPage.sidebar.surveyStatusSelect).toHaveValue('published')
  return publishedSurveyId
}

test.describe('Responder Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()
    await authPage.page.waitForLoadState('domcontentloaded')
    await authPage.fillLoginForm(defaultObjects.user.email, defaultObjects.user.password)
    await page.waitForURL('**/dashboard', { timeout: PAGE_REDIRECT_TIMEOUT })
    await page.locator('nav a').getByText('Builder').click()
    await page.waitForURL('**/survey-builder', { timeout: PAGE_REDIRECT_TIMEOUT })
  })

  test('keeps designed layout for responder page', async ({ page, browser }) => {
    const publishedSurveyId = await loadPublishedDemoSurvey(page)

    const anonymousContext = await browser.newContext()
    const anonymousPage = await anonymousContext.newPage()
    await anonymousPage.goto(`/survey/${publishedSurveyId}`)

    const grid = anonymousPage.getByTestId('public-survey-grid')
    const questionCard = anonymousPage.locator('.grid-item').first()

    await expect(grid).toBeVisible()
    await expect(questionCard).toBeVisible()

    const [gridBox, questionBox] = await Promise.all([
      grid.boundingBox(),
      questionCard.boundingBox(),
    ])

    expect(gridBox).not.toBeNull()
    expect(questionBox).not.toBeNull()
    expect(questionBox!.x).toBeGreaterThan(gridBox!.x + 80)
    expect(questionBox!.y).toBeGreaterThan(gridBox!.y + 20)

    await anonymousContext.close()
  })

  test('stores responder submission and renders latest response in dashboard', async ({ page, browser }) => {
    const publishedSurveyId = await loadPublishedDemoSurvey(page)

    const anonymousContext = await browser.newContext()
    const anonymousPage = await anonymousContext.newPage()
    await anonymousPage.goto(`/survey/${publishedSurveyId}`)
    await anonymousPage.getByText('Option A').click()
    await anonymousPage.getByRole('button', { name: 'Submit Response' }).click()
    await expect(anonymousPage.getByText('Thank you for your response')).toBeVisible({ timeout: PAGE_REDIRECT_TIMEOUT })
    await anonymousContext.close()

    await page.goto('/dashboard')
    await expect(page.getByTestId('surveys-table')).toBeVisible({ timeout: PAGE_REDIRECT_TIMEOUT })

    const publishedRow = page.locator('[data-testid="surveys-table"] tr', { hasText: 'Published Demo Survey' }).first()
    await expect(publishedRow).toBeVisible({ timeout: PAGE_REDIRECT_TIMEOUT })
    await publishedRow.click()

    const previewCard = page.getByTestId('latest-response-preview')
    await expect(previewCard).toBeVisible()
    await expect(previewCard).toContainText('Response ID')
    await expect(previewCard).toContainText('Option A')
  })
})
