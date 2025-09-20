import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/authPage';
// need more development in mock library
// import { setupBackendMocks } from '../mocks/backend';

test.describe('Auth Page', () => {
    let authPage: AuthPage;
  test.beforeEach(async ({ page }) => {
    // await setupBackendMocks(page);
    authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.page.waitForLoadState('domcontentloaded');
  });

  test('should display validation errors on empty submission', async () => {
    await authPage.submitButton.click();
    await expect(authPage.getInfoLabel('Authentication failed', 'error')).toBeVisible();
    // not implemented yet
    // await expect(authPage.getInfoLabel('Password is required', 'error')).toBeVisible(); 
  });
});