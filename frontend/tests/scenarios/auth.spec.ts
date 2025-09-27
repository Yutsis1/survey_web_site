import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/authPage';
// need more development in mock library
// import { setupBackendMocks } from '../mocks/backend';

test.describe('Auth Page', async () => {
  let authPage: AuthPage;
  // Selector for the logout button to verify successful login
  // Don't have strong opinion on this, but maybe it would be better to move this to page object as well
  // but this is only used in one place so ¯\_(ツ)_/¯
  const logoutSelector = 'button-logout'
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
  test('should login a new user successfully', async () => {
    await test.step('Fill login form and submit', async () => {
      await authPage.fillLoginForm('kek_persistent@lol.com', 'password123');
      await expect(authPage.page.getByTestId(logoutSelector)).toBeVisible();
      await authPage.page.getByTestId(logoutSelector).click();
      await expect(authPage.emailInput).toBeVisible();
      await authPage.page.reload();
      await expect(authPage.emailInput).toBeVisible();
    });
  });
  test('should register a new user successfully', async () => {
    await test.step('Fill registration form and submit', async () => {
      await authPage.fillRegisterAuthForm(`newuser_${Date.now()}@example.com`, 'password123', 'password123');
      await expect(authPage.page.getByTestId(logoutSelector)).toBeVisible();
      await authPage.page.getByTestId(logoutSelector).click();
      await expect(authPage.emailInput).toBeVisible();
      await authPage.page.reload();
      await expect(authPage.emailInput).toBeVisible();
    });
  });
});