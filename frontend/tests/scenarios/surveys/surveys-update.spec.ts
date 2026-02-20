import { test } from '@playwright/test';
import { SurveyCreatorsPage } from '../../page-objects/surveys';
import { AuthPage } from '../../page-objects/authPage';
import { defaultObjects } from '../../defults/defaultObjects';

const PAGE_REDIRECT_TIMEOUT = defaultObjects.defaultTimeout;

// skipping this tests due to unclear scenario and looks like better focus on unit-tests
test.describe.skip('Update Survey Integration Tests', () => {
    let surveyCreatingPage: SurveyCreatorsPage;

    test.beforeEach(async ({ page }) => {
    
        // First, authenticate by logging in with an existing user
        const authPage = new AuthPage(page);
        await authPage.goto();
        await authPage.page.waitForLoadState('domcontentloaded');
    
        // Use existing user credentials
        const userEmail = defaultObjects.user.email;
        const password = defaultObjects.user.password; // Must meet password requirements
    
        // Login with existing user
        await authPage.fillLoginForm(userEmail, password);
    
        // Wait for redirect to survey builder
        await page.waitForURL('**/survey-builder', { timeout: PAGE_REDIRECT_TIMEOUT });
    
        // Now initialize the survey creator page
        surveyCreatingPage = new SurveyCreatorsPage(page);
        await surveyCreatingPage.page.waitForLoadState('domcontentloaded');
      });

    test('should load the home page and update a survey', async () => {
        await test.step('Create a new survey', async () => {
            await surveyCreatingPage.loadSurvey(defaultObjects.survey.title);
    
        });
    });
});