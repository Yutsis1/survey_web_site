import { test, expect } from '@playwright/test'
import { SurveyCreatorsPage } from '../page-objects/surveys'
import { setupBackendMocks } from './mocks/backend'
import { defaultObjects } from '../defults/defaultObjects'

const defaultTimeout = defaultObjects.defaultTimeout

type SavedSurveyPayload = {
  title: string
  status: 'draft' | 'published'
  questions: Array<{
    questionText: string
    component: string
    option?: {
      optionProps?: {
        checked?: boolean
      }
    }
  }>
}

test.describe('Survey Builder Question Editing Service Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage
  let savedPayload: SavedSurveyPayload | null

  test.beforeEach(async ({ page }) => {
    savedPayload = null
    await setupBackendMocks(page)

    await page.route('**/api/proxy/surveys', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback()
        return
      }

      const postData = route.request().postData()
      savedPayload = postData ? (JSON.parse(postData) as SavedSurveyPayload) : null

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'saved-survey-id' }),
      })
    })

    await page.goto('/survey-builder')
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: defaultTimeout })
  })

  test('can edit question title at survey level', async () => {
    const originalTitle = 'Original Question Title'
    const updatedTitle = 'Updated Question Title'

    await surveyCreatingPage.clickNewQuestion()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
    await surveyCreatingPage.newQuestionPopup.configureTextInput({
      questionText: originalTitle,
      fieldLabel: 'Name',
      placeholder: 'Type your answer',
    })
    await surveyCreatingPage.applyPopup()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()

    const questionCard = surveyCreatingPage.getQuestionCardByIndex(0)
    await expect(questionCard).toBeVisible()
    await expect(questionCard).toContainText(originalTitle)

    const inlineTitleInput = surveyCreatingPage.getQuestionCardInlineTitleInput(questionCard)
    await expect(inlineTitleInput).toBeVisible()
    await inlineTitleInput.fill(updatedTitle)
    await expect(questionCard).toContainText(updatedTitle)

    await surveyCreatingPage.saveSurvey('Survey title inline edit')

    expect(savedPayload).not.toBeNull()
    expect(savedPayload?.questions).toEqual(
      expect.arrayContaining([expect.objectContaining({ questionText: updatedTitle })])
    )
  })

  test('switch saves configured default state', async () => {
    const switchQuestionTitle = 'Switch default persistence question'

    await surveyCreatingPage.clickNewQuestion()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
    await surveyCreatingPage.newQuestionPopup.configureSwitch({
      questionText: switchQuestionTitle,
      activeLabel: 'Enabled',
      inactiveLabel: 'Disabled',
      defaultState: false,
    })
    await surveyCreatingPage.applyPopup()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()

    const questionCard = surveyCreatingPage.getQuestionCardByQuestionText(switchQuestionTitle)
    await expect(questionCard).toBeVisible()

    const switchControl = surveyCreatingPage.getQuestionCardSwitch(questionCard)
    await expect(switchControl).toHaveAttribute('aria-checked', 'false')
    await switchControl.click()
    await expect(switchControl).toHaveAttribute('aria-checked', 'true')

    await surveyCreatingPage.saveSurvey('Switch default save contract')

    expect(savedPayload).not.toBeNull()
    const savedSwitchQuestion = savedPayload?.questions.find(
      (question) => question.questionText === switchQuestionTitle
    )
    expect(savedSwitchQuestion).toBeDefined()
    expect(savedSwitchQuestion?.option?.optionProps?.checked).toBe(false)
  })

  test('radiobar has no default selected choice', async () => {
    const radioQuestionTitle = 'Radio default selection question'

    await surveyCreatingPage.clickNewQuestion()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
    await surveyCreatingPage.newQuestionPopup.configureRadioBar({
      questionText: radioQuestionTitle,
      groupName: 'radio-default-group',
      options: ['Option 1', 'Option 2'],
    })
    await surveyCreatingPage.applyPopup()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()

    const questionCard = surveyCreatingPage.getQuestionCardByQuestionText(radioQuestionTitle)
    await expect(questionCard).toBeVisible()

    const optionOne = surveyCreatingPage.getQuestionCardRadioOption(questionCard, 'Option 1')
    const optionTwo = surveyCreatingPage.getQuestionCardRadioOption(questionCard, 'Option 2')

    await expect(optionOne).toHaveAttribute('aria-checked', 'false')
    await expect(optionTwo).toHaveAttribute('aria-checked', 'false')
    await expect(surveyCreatingPage.getCheckedRadioOptions(questionCard)).toHaveCount(0)
  })

  test('radiobar can be unselected to none', async () => {
    const radioQuestionTitle = 'Radio clear selected option question'

    await surveyCreatingPage.clickNewQuestion()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
    await surveyCreatingPage.newQuestionPopup.configureRadioBar({
      questionText: radioQuestionTitle,
      groupName: 'radio-clear-group',
      options: ['Option A', 'Option B'],
    })
    await surveyCreatingPage.applyPopup()
    await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()

    const questionCard = surveyCreatingPage.getQuestionCardByQuestionText(radioQuestionTitle)
    await expect(questionCard).toBeVisible()

    const optionA = surveyCreatingPage.getQuestionCardRadioOption(questionCard, 'Option A')
    await optionA.click()
    await expect(optionA).toHaveAttribute('aria-checked', 'true')
    await expect(surveyCreatingPage.getCheckedRadioOptions(questionCard)).toHaveCount(1)

    await optionA.click()
    await expect(optionA).toHaveAttribute('aria-checked', 'false')
    await expect(surveyCreatingPage.getCheckedRadioOptions(questionCard)).toHaveCount(0)
  })
})
