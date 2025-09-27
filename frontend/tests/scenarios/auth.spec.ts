import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/authPage';
// need more development in mock library
// import { setupBackendMocks } from '../mocks/backend';

test.describe('Auth Page', async () => {
  let authPage: AuthPage;
  test.beforeEach(async ({ page }) => {
    // await setupBackendMocks(page);
    authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.page.waitForLoadState('domcontentloaded');
  });

  test('should display validation errors on empty submission', async () => {

    test.step('Submit empty form and check for validation errors', async () => {
      await authPage.submitButton.click();
      await expect(authPage.getInfoLabel('Authentication failed', 'error')).toBeVisible();
    });
  });
  test('should register a new user successfully', async () => {
    await test.step('Fill registration form and submit', async () => {
      await authPage.fillRegisterAuthForm(`newuser_${Date.now()}@example.com`, 'password123', 'password123');
      await expect(authPage.page.getByTestId('button-logout')).toBeVisible();
      await authPage.page.getByTestId('button-logout').click();
      // to do implement logout confirmation
    });
  });
});