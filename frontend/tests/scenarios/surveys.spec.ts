import { test, expect } from '@playwright/test';
import { SurveyCreatorsPage } from '../page-objects/surveys';

test.describe('Home Page Integration Tests', () => {
  let surveyCreatingPage: SurveyCreatorsPage;

  test.beforeEach(async ({ page }) => {
    surveyCreatingPage = new SurveyCreatorsPage(page);
    await surveyCreatingPage.goto();
  });

  test('should load the home page', async () => {
    await expect(surveyCreatingPage.page).toHaveTitle(/Survey Web Site/); // Adjust title if needed
    await expect(surveyCreatingPage.newQuestionButton).toBeVisible();
    await expect(surveyCreatingPage.gridContainer).toBeVisible();
  });

  test('should open popup when clicking new question', async () => {
    await surveyCreatingPage.clickNewQuestion();
    await expect(surveyCreatingPage.popup).toBeVisible();
  });

  test('should add a new question', async () => {
    const initialCount = await surveyCreatingPage.getQuestionCount();
    await surveyCreatingPage.clickNewQuestion();
    // Assuming default selection or add selection logic
    await surveyCreatingPage.applyPopup();
    await expect(surveyCreatingPage.popup).not.toBeVisible();
    const newCount = await surveyCreatingPage.getQuestionCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should clear all questions', async () => {
    // Add a question first
    await surveyCreatingPage.clickNewQuestion();
    await surveyCreatingPage.applyPopup();
    expect(await surveyCreatingPage.getQuestionCount()).toBeGreaterThan(0);

    await surveyCreatingPage.clickClearQuestions();
    await expect(surveyCreatingPage.page.locator('.grid-item')).toHaveCount(0);
  });

  test('should save and load survey', async ({ page }) => {
    // Add a question
    await surveyCreatingPage.clickNewQuestion();
    await surveyCreatingPage.applyPopup();
    const countBeforeSave = await surveyCreatingPage.getQuestionCount();

    // Mock the save and load since it uses alert and prompt
    // In real test, might need to mock the API or handle dialogs
    await page.on('dialog', async dialog => {
      if (dialog.type() === 'alert') {
        await dialog.accept();
      } else if (dialog.type() === 'prompt') {
        await dialog.accept('test-id');
      }
    });

    await surveyCreatingPage.clickSaveSurvey();
    // Wait for alert

    await surveyCreatingPage.clickLoadSurvey();
    // Wait for alert

    const countAfterLoad = await surveyCreatingPage.getQuestionCount();
    expect(countAfterLoad).toBe(countBeforeSave);
  });

  test('should delete question by dragging to trash', async () => {
    // Add a question
    await surveyCreatingPage.clickNewQuestion();
    await surveyCreatingPage.applyPopup();
    expect(await surveyCreatingPage.getQuestionCount()).toBe(1);

    await surveyCreatingPage.dragQuestionToTrash(0);
    await expect(surveyCreatingPage.page.locator('.grid-item')).toHaveCount(0);
  });

  // Add more tests as needed
});
