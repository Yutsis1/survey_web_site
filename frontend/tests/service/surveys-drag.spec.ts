import { test, expect, type Locator } from '@playwright/test'
import { SurveyCreatorsPage } from '../page-objects/surveys'
import { setupBackendMocks } from './mocks/backend'
import { defaultObjects } from '../defults/defaultObjects'

const defaultTimeout = defaultObjects.defaultTimeout
const minimumMovePx = 30

async function getBoundingBoxOrThrow(locator: Locator, name: string) {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Missing bounding box for ${name}`)
  }
  return box
}

test.describe('Survey Builder Drag Service Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage

  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page)
    await page.goto('/survey-builder')
    surveyCreatingPage = new SurveyCreatorsPage(page)
    await surveyCreatingPage.sidebar.newQuestionButton.waitFor({ state: 'visible', timeout: defaultTimeout })
  })

  test('drags a question tile to a new location in the builder', async ({ page }) => {
    await surveyCreatingPage.clickLoadSurvey()
    await surveyCreatingPage.loadSurveyPopup.dropdown.waitFor({ state: 'visible', timeout: defaultTimeout })
    await surveyCreatingPage.loadSurveyPopup.waitForSurveysToLoad()
    await surveyCreatingPage.loadSurveyPopup.selectSurveyById('survey-radio')
    await surveyCreatingPage.applyPopup()

    const questionCard = page.locator('.grid-item', { hasText: 'Pick one option' }).first()
    const dragHandle = questionCard.locator('.drag-handle')

    await expect(questionCard).toBeVisible()
    await expect(dragHandle).toBeVisible()

    const beforeCardBox = await getBoundingBoxOrThrow(questionCard, 'question card before drag')
    const dragHandleBox = await getBoundingBoxOrThrow(dragHandle, 'drag handle')
    const gridBox = await getBoundingBoxOrThrow(surveyCreatingPage.gridContainer, 'grid container')

    const startX = dragHandleBox.x + dragHandleBox.width / 2
    const startY = dragHandleBox.y + dragHandleBox.height / 2
    const targetX = gridBox.x + 40
    const targetY = gridBox.y + 40

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(targetX, targetY, { steps: 20 })
    await page.mouse.up()

    await expect
      .poll(
        async () => {
          const afterCardBox = await questionCard.boundingBox()
          if (!afterCardBox) return 0

          const movedX = Math.abs(afterCardBox.x - beforeCardBox.x)
          const movedY = Math.abs(afterCardBox.y - beforeCardBox.y)
          return Math.max(movedX, movedY)
        },
        { timeout: defaultTimeout }
      )
      .toBeGreaterThan(minimumMovePx)

    expect(await surveyCreatingPage.getQuestionCount()).toBe(1)
  })
})
