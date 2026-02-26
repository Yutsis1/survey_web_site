import { test, expect } from '@playwright/test'
import { setupBackendMocks } from './mocks/backend'
import { DEFAULT_SURVEY_ID, mockSurveys } from './mocks/data'
import { DashboardPage } from '../page-objects/dashboardPage'

test.describe('Dashboard Service Tests', () => {
    let dashboardPage: DashboardPage

    test.beforeEach(async ({ page }) => {
        await setupBackendMocks(page)
        dashboardPage = new DashboardPage(page)
        await dashboardPage.goto()
    })

    test('links to the survey builder edit page', async () => {
        await test.step('should display the Edit link for each survey and navigate to the correct survey builder page', async () => {
            const firstSurveyTitle = mockSurveys[0]?.title ?? 'RadioBar Survey'
            await dashboardPage.waitForDataLoad()
            await expect(dashboardPage.getSurveyRow(firstSurveyTitle)).toBeVisible()
            const editLink = dashboardPage.getSurveyEditButton(firstSurveyTitle)
            await expect(editLink).toHaveAttribute('href', `/survey-builder/${DEFAULT_SURVEY_ID}`)
        })

        await test.step('should load the correct survey in the survey builder when Edit link is clicked', async () => {
            const firstSurveyTitle = mockSurveys[0]?.title ?? 'RadioBar Survey'
            const editLink = dashboardPage.getSurveyEditButton(firstSurveyTitle)
            await editLink.click()
            await expect(dashboardPage.page).toHaveURL(`/survey-builder/${DEFAULT_SURVEY_ID}`)
        })
    })
})
