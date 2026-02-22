import { test, expect } from '@playwright/test'
import { SurveyCreatorsPage } from '../../page-objects/surveys'
import { AuthPage } from '../../page-objects/authPage'
import { defaultObjects } from '../../defults/defaultObjects'


const PAGE_REDIRECT_TIMEOUT = defaultObjects.defaultTimeout

// Skipping due to 
test.describe('Home Page Integration Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage

  test.beforeEach(async ({ page }) => {

    // First, authenticate by registering a new user
    const authPage = new AuthPage(page)
    await authPage.goto()
    await authPage.page.waitForLoadState('domcontentloaded')

    // Generate unique email for this test run
    const uniqueEmail = `test_${Date.now()}@example.com`
    const password = defaultObjects.user.password // Must meet password requirements

    // Register a new user
    await authPage.fillRegisterAuthForm(uniqueEmail, password, password)

    // Wait for redirect to survey dashboard
    await page.waitForURL('**/dashboard', { timeout: PAGE_REDIRECT_TIMEOUT })

    await authPage.page.locator('nav a').getByText('Builder').click()

    // Now initialize the survey creator page
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.page.waitForLoadState('domcontentloaded')
  })

  test('should load the home page and create questions', async () => {

    await test.step('Configure radio bar question', async () => {
      await surveyCreatingPage.clickNewQuestion()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
      await surveyCreatingPage.newQuestionPopup.configureRadioBar({
        questionText: 'Sample Radio Question',
        groupName: 'Sample Group',
        options: ['Option 1', 'Option 2', 'Option 3'],
      })
      await surveyCreatingPage.applyPopup()
      // Wait for popup to close before proceeding
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()
    })

    await test.step('Configure text input question', async () => {
      await surveyCreatingPage.clickNewQuestion()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
      await surveyCreatingPage.newQuestionPopup.configureTextInput({
        questionText: 'Sample Text Input Question',
        fieldLabel: 'Sample Field Label',
        placeholder: 'Sample Placeholder',
      })
      await surveyCreatingPage.applyPopup()
      // Wait for popup to close before proceeding
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()
    })

    await test.step('Configure checkbox question', async () => {
      await surveyCreatingPage.clickNewQuestion()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
      await surveyCreatingPage.newQuestionPopup.configureCheckbox({
        questionText: 'Sample Checkbox Question',
        activeLabel: 'Yes',
        inactiveLabel: 'No',
        defaultState: true,
      })
      await surveyCreatingPage.applyPopup()
      // Wait for popup to close before proceeding
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()
    })

    // Verify all questions were created
    const questionCount = await surveyCreatingPage.getQuestionCount()
    expect(questionCount).toBe(3)

    await test.step('Save the survey', async () => {
      await surveyCreatingPage.saveSurvey('Test Survey')
    })
  })
})
