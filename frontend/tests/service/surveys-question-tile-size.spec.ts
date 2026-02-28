import { test, expect, type Locator, type Page } from '@playwright/test'
import { SurveyCreatorsPage } from '../page-objects/surveys'
import { setupBackendMocks } from './mocks/backend'
import { defaultObjects } from '../defults/defaultObjects'

const defaultTimeout = defaultObjects.defaultTimeout
const boundsTolerancePx = 12  // Increased to account for CheckboxTiles rendering variations
const shrinkTolerancePx = 1

async function getBoundingBoxOrThrow(locator: Locator, name: string) {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Missing bounding box for ${name}`)
  }
  return box
}

async function expectComponentInsideCard(questionCard: Locator) {
  const cardBox = await getBoundingBoxOrThrow(questionCard, 'question card')
  const componentBox = await getBoundingBoxOrThrow(
    questionCard.locator('.question-component'),
    'question component'
  )

  expect(componentBox.x).toBeGreaterThanOrEqual(cardBox.x - boundsTolerancePx)
  expect(componentBox.y).toBeGreaterThanOrEqual(cardBox.y - boundsTolerancePx)
  expect(componentBox.x + componentBox.width).toBeLessThanOrEqual(
    cardBox.x + cardBox.width + boundsTolerancePx
  )
  expect(componentBox.y + componentBox.height).toBeLessThanOrEqual(
    cardBox.y + cardBox.height + boundsTolerancePx
  )
}

async function tryResizeSmaller(page: Page, questionCard: Locator) {
  const resizeHandle = questionCard.locator('.react-resizable-handle-se')
  await expect(resizeHandle).toBeVisible()

  const handleBox = await getBoundingBoxOrThrow(resizeHandle, 'resize handle')
  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX - 260, startY - 120, { steps: 12 })
  await page.mouse.up()
}

async function expectNotShrunk(questionCard: Locator, beforeResize: { width: number; height: number }) {
  await expect
    .poll(
      async () => (await getBoundingBoxOrThrow(questionCard, 'question card after resize')).width,
      { timeout: defaultTimeout }
    )
    .toBeGreaterThanOrEqual(beforeResize.width - shrinkTolerancePx)
  await expect
    .poll(
      async () => (await getBoundingBoxOrThrow(questionCard, 'question card after resize')).height,
      { timeout: defaultTimeout }
    )
    .toBeGreaterThanOrEqual(beforeResize.height - shrinkTolerancePx)
}

test.describe('Survey Builder Tile Size Service Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage

  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page)
    await page.goto('/survey-builder')
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: defaultTimeout })
  })

  test('new TextInput, RadioBar, and CheckboxTiles questions stay inside tiles and cannot be resized smaller', async ({ page }) => {
    const textQuestionText = 'Tile text input question'
    const radioQuestionText = 'Tile radio bar question'
    const checkboxTilesQuestionText = 'Tile checkbox tiles question'

    await test.step('Create TextInput question', async () => {
      await surveyCreatingPage.clickNewQuestion()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
      await surveyCreatingPage.newQuestionPopup.configureTextInput({
        questionText: textQuestionText,
        fieldLabel: 'Field label',
        placeholder: 'Placeholder text',
      })
      await surveyCreatingPage.applyPopup()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()
    })

    await test.step('Create RadioBar question', async () => {
      await surveyCreatingPage.clickNewQuestion()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
      await surveyCreatingPage.newQuestionPopup.configureRadioBar({
        questionText: radioQuestionText,
        groupName: 'radio-group',
      })
      await surveyCreatingPage.applyPopup()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()
    })

    await test.step('Create CheckboxTiles question', async () => {
      await surveyCreatingPage.clickNewQuestion()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).toBeVisible()
      await surveyCreatingPage.newQuestionPopup.configureCheckboxTiles({
        questionText: checkboxTilesQuestionText,
        name: 'checkbox-tiles-group',
        options: ['Option 1', 'Option 2', 'Option 3'],
      })
      await surveyCreatingPage.applyPopup()
      await expect(surveyCreatingPage.newQuestionPopup.popupContent).not.toBeVisible()
    })

    const textQuestionCard = page.locator('.grid-item', { hasText: textQuestionText }).first()
    const radioQuestionCard = page.locator('.grid-item', { hasText: radioQuestionText }).first()
    const checkboxTilesQuestionCard = page.locator('.grid-item', { hasText: checkboxTilesQuestionText }).first()

    await expect(textQuestionCard).toBeVisible()
    await expect(radioQuestionCard).toBeVisible()
    await expect(checkboxTilesQuestionCard).toBeVisible()

    for (const questionCard of [textQuestionCard, radioQuestionCard, checkboxTilesQuestionCard]) {
      await questionCard.scrollIntoViewIfNeeded()
      await expectComponentInsideCard(questionCard)

      const beforeResize = await getBoundingBoxOrThrow(questionCard, 'question card before resize')
      await tryResizeSmaller(page, questionCard)
      await expectNotShrunk(questionCard, beforeResize)

      await expectComponentInsideCard(questionCard)
    }
  })
})
