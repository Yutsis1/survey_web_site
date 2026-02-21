import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/authPage';
import { defaultObjects } from '../defults/defaultObjects';

const AUTH_UI_READY_TIMEOUT = 15000;
const AUTH_ERROR_TIMEOUT = 15000;
const PAGE_REDIRECT_TIMEOUT = 20000;
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
    await authPage.waitUntilReady(AUTH_UI_READY_TIMEOUT);
  });

  test('should display validation errors on empty submission', async () => {
    await test.step('Submit empty form and check for validation errors', async () => {
      // Wait for submit button to be visible and enabled
      await expect(authPage.submitButton).toBeVisible({ timeout: AUTH_UI_READY_TIMEOUT });
      await authPage.submitButton.click();
      await expect(authPage.getInfoLabel('Authentication failed', 'error')).toBeVisible({
        timeout: AUTH_ERROR_TIMEOUT,
      });
      await expect(authPage.page).toHaveURL(/\/auth(?:[/?#].*)?$/);
    });
  });
  test('should login a new user successfully', async () => {
    await test.step('Fill login form and submit', async () => {
      // First register a user
      const uniqueEmail = `login_test_${Date.now()}@example.com`;
      const validPassword = defaultObjects.user.password;
      await authPage.fillRegisterAuthForm(uniqueEmail, validPassword, validPassword);

      // After successful registration, should redirect to dashboard
      await authPage.page.waitForURL('**/dashboard', { timeout: PAGE_REDIRECT_TIMEOUT });

      // Verify logout button is visible
      // TODO: write down an pageobnject for dashboard and move this selector there
      // await expect(authPage.page.getByTestId(logoutSelector)).toBeVisible();
      const dropdownTrigger = authPage.page.locator('button[data-slot=dropdown-menu-trigger]');
      await expect(dropdownTrigger).toBeVisible({ timeout: AUTH_UI_READY_TIMEOUT });


      // Logout
      await dropdownTrigger.click();
      await authPage.page.locator('div[data-slot=dropdown-menu-item]').getByText('Logout').click();
      // await authPage.page.getByTestId(logoutSelector).click();

      // After logout, should be back at auth page
      await authPage.waitUntilReady(AUTH_UI_READY_TIMEOUT);

      // Reload page and verify auth page
      await authPage.page.reload();
      await authPage.waitUntilReady(AUTH_UI_READY_TIMEOUT);

      // Now login with the same credentials
      await authPage.fillLoginForm(uniqueEmail, validPassword);
      await authPage.page.waitForURL('**/dashboard', { timeout: PAGE_REDIRECT_TIMEOUT });
      // TODO: rework expectation for logout button to use dashboard page object
      // await expect(authPage.page.getByTestId(logoutSelector)).toBeVisible();
    });
  });
  test('should register a new user successfully', async () => {
    await test.step('Fill registration form and submit', async () => {
      const validPassword = defaultObjects.user.password;
      await authPage.fillRegisterAuthForm(`newuser_${Date.now()}@example.com`, validPassword, validPassword);
      await authPage.page.waitForURL('**/dashboard', { timeout: PAGE_REDIRECT_TIMEOUT });
      // TODO: Rework to use dashboard page object
      const dropdownTrigger = authPage.page.locator('button[data-slot=dropdown-menu-trigger]');
      await expect(dropdownTrigger).toBeVisible({ timeout: AUTH_UI_READY_TIMEOUT });

      // TODO: rework expectation for logout button to use dashboard page object
      await dropdownTrigger.click();
      await authPage.page.locator('div[data-slot=dropdown-menu-item]').getByText('Logout').click();

      await authPage.waitUntilReady(AUTH_UI_READY_TIMEOUT);
      await authPage.page.reload();
      await authPage.waitUntilReady(AUTH_UI_READY_TIMEOUT);
    });
  });
});
// 
