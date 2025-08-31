import { test, expect } from '@playwright/test';
import { SurveyCreatorsPage } from '../page-objects/surveys';

test.describe('Home Page Integration Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage;

  test.beforeEach(async ({ page }) => {
    surveyCreatingPage = new SurveyCreatorsPage(page);
    await surveyCreatingPage.goto();
  });

  test('should load the home page', async () => {
    await expect(surveyCreatingPage.gridContainer).toBeVisible();
  });

});
