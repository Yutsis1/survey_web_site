import { test, expect } from '@playwright/test'
import { setupBackendMocks } from './mocks/backend'

const THEME_STORAGE_KEY = 'theme-preference'

test.describe('Theme Service Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page)
    await page.addInitScript((key) => {
      localStorage.setItem(key, 'dark')
    }, THEME_STORAGE_KEY)
    await page.goto('/survey-builder')
    await page.getByTestId('account-menu-trigger').waitFor({ state: 'visible', timeout: 15000 })
  })

  test('switches to light theme', async ({ page }) => {
    await page.getByTestId('account-menu-trigger').click()
    await page.getByLabel('Toggle theme').click()

    await expect(page.locator('html')).toHaveClass(/\blight\b/)

    const storedTheme = await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY)
    expect(storedTheme).toBe('light')
  })
})
