import { Page, Locator, expect } from '@playwright/test'
import { defaultObjects } from '../defults/defaultObjects'

const WAIT_TIMEOUT = defaultObjects.defaultTimeout

export class DashboardPage {
  readonly page: Page

  // Summary cards
  readonly totalSurveysCard: Locator
  readonly totalResponsesCard: Locator
  readonly avgCompletionRateCard: Locator
  readonly activeSurveysCard: Locator

  // Surveys table
  readonly surveysTable: Locator
  readonly surveysTableBody: Locator

  // Loading/Error states
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Summary cards
    this.totalSurveysCard = page.getByTestId('summary-card-total-surveys')
    this.totalResponsesCard = page.getByTestId('summary-card-total-responses')
    this.avgCompletionRateCard = page.getByTestId('summary-card-avg-completion-rate')
    this.activeSurveysCard = page.getByTestId('summary-card-active-surveys')

    // Surveys table
    this.surveysTable = page.getByTestId('surveys-table')
    this.surveysTableBody = this.surveysTable.locator('tbody')

    // Loading/Error states
    this.loadingIndicator = page.getByText('Loading dashboard...')
    this.errorMessage = page.getByTestId('dashboard-error')
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  async waitUntilReady(timeout = WAIT_TIMEOUT) {
    await expect(this.surveysTable).toBeVisible({ timeout })
  }

  /**
   * Get a survey row by title
   */
  getSurveyRow(surveyTitle: string): Locator {
    return this.surveysTableBody.getByRole('row', { name: new RegExp(surveyTitle, 'i') })
  }

  /**
   * Get the Edit button for a specific survey row
   */
  getSurveyEditButton(surveyTitle: string): Locator {
    const row = this.getSurveyRow(surveyTitle)
    return row.getByRole('link', { name: 'Edit' })
  }

  /**
   * Get the Share button for a specific survey row
   */
  getSurveyShareButton(surveyTitle: string): Locator {
    const row = this.getSurveyRow(surveyTitle)
    return row.getByRole('button', { name: 'Share' })
  }

  /**
   * Get the View button for a specific survey row
   */
  getSurveyViewButton(surveyTitle: string): Locator {
    const row = this.getSurveyRow(surveyTitle)
    return row.getByRole('link', { name: 'View' })
  }

  /**
   * Click on a survey row to select it
   */
  async selectSurvey(surveyTitle: string) {
    const row = this.getSurveyRow(surveyTitle)
    await row.click()
  }

  /**
   * Get summary card value by card type
   */
  getSummaryCardValue(cardType: 'total-surveys' | 'total-responses' | 'avg-completion-rate' | 'active-surveys'): Locator {
    const card = this.page.getByTestId(`summary-card-${cardType}`)
    return card.locator('.text-2xl')
  }

  /**
   * Get survey status badge from a row
   */
  getSurveyStatus(surveyTitle: string): Locator {
    const row = this.getSurveyRow(surveyTitle)
    return row.locator('[data-testid="survey-status-badge"]')
  }

  /**
   * Get survey responses count from a row
   */
  getSurveyResponsesCount(surveyTitle: string): Locator {
    const row = this.getSurveyRow(surveyTitle)
    return row.locator('[data-testid="survey-responses-count"]')
  }

  /**
   * Wait for loading to complete
   */
  async waitForDataLoad(timeout = WAIT_TIMEOUT) {
    await expect(this.loadingIndicator).toBeHidden({ timeout })
    await this.waitUntilReady(timeout)
  }

  /**
   * Check if error message is displayed
   */
  async expectError(errorText?: string) {
    if (errorText) {
      await expect(this.errorMessage).toContainText(errorText)
    } else {
      await expect(this.errorMessage).toBeVisible()
    }
  }
}
