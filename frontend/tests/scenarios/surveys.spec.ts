import { test, expect } from '@playwright/test';
import { SurveyCreatorsPage } from '../page-objects/surveys';
import { AuthPage } from '../page-objects/authPage';
import { setupBackendMocks } from '../mocks/backend';

test.describe('Home Page Integration Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage;

  test.beforeEach(async ({ page }) => {
    await setupBackendMocks(page);
    
    // First, authenticate by registering a new user
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.page.waitForLoadState('domcontentloaded');
    
    // Generate unique email for this test run
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const password = 'Test@1234'; // Must meet password requirements
    
    // Register a new user
    await authPage.fillRegisterAuthForm(uniqueEmail, password, password);
    
    // Wait for redirect to survey builder
    await page.waitForURL('**/survey-builder', { timeout: 5000 });
    
    // Now initialize the survey creator page
    surveyCreatingPage = new SurveyCreatorsPage(page);
    await surveyCreatingPage.page.waitForLoadState('domcontentloaded');
  });

  test('should load the home page and create questions', async () => {

    await test.step('Configure radio bar question', async () => {
      await surveyCreatingPage.clickNewQuestion();
      await expect(surveyCreatingPage.popup.popupContent).toBeVisible();
      await surveyCreatingPage.popup.configureRadioBar({
        questionText: 'Sample Radio Question',
        groupName: 'Sample Group',
        options: ['Option 1', 'Option 2', 'Option 3'],
      });
      await surveyCreatingPage.applyPopup();
      // Wait for popup to close before proceeding
      await expect(surveyCreatingPage.popup.popupContent).not.toBeVisible();
    });

    await test.step('Configure text input question', async () => {
      await surveyCreatingPage.clickNewQuestion();
      await expect(surveyCreatingPage.popup.popupContent).toBeVisible();
      await surveyCreatingPage.popup.configureTextInput({
        questionText: 'Sample Text Input Question',
        fieldLabel: 'Sample Field Label',
        placeholder: 'Sample Placeholder',
      });
      await surveyCreatingPage.applyPopup();
      // Wait for popup to close before proceeding
      await expect(surveyCreatingPage.popup.popupContent).not.toBeVisible();
    });

    await test.step('Configure checkbox question', async () => {
      await surveyCreatingPage.clickNewQuestion();
      await expect(surveyCreatingPage.popup.popupContent).toBeVisible();
      await surveyCreatingPage.popup.configureCheckbox({
        questionText: 'Sample Checkbox Question',
        activeLabel: 'Yes',
        inactiveLabel: 'No',
        defaultState: true,
      });
      await surveyCreatingPage.applyPopup();
      // Wait for popup to close before proceeding
      await expect(surveyCreatingPage.popup.popupContent).not.toBeVisible();
    });

    // Verify all questions were created
    const questionCount = await surveyCreatingPage.getQuestionCount();
    expect(questionCount).toBe(3);
  });
});
