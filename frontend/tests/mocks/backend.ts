import { Page } from '@playwright/test';

/**
 * Sets up backend mocks for survey-related API routes using Playwright's page routing.
 * 
 * This function intercepts requests to `/surveys` and `/surveys/*` endpoints, providing mock responses
 * to simulate backend behavior during testing. It handles POST requests to create surveys and GET
 * requests to retrieve survey details.
 * 
 * @param page - The Playwright Page instance on which to set up the route handlers.
 * @returns A Promise that resolves when all route handlers are set up.
 */
export async function setupBackendMocks(page: Page) {
  await page.route('**/surveys', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'mock-id' }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/surveys/*', async (route) => {
    const mockSurvey = { id: 'mock-id', title: 'Mock Survey', questions: [] };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSurvey),
    });
  });
}
