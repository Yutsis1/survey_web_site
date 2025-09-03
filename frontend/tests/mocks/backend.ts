import { Page } from '@playwright/test';

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
