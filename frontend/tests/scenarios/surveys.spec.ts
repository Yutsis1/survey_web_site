import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/surveys';

test.describe('Home Page Integration Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should load the home page', async () => {
    await expect(homePage.page).toHaveTitle(/Survey Web Site/); // Adjust title if needed
    await expect(homePage.newQuestionButton).toBeVisible();
    await expect(homePage.gridContainer).toBeVisible();
  });

  test('should open popup when clicking new question', async () => {
    await homePage.clickNewQuestion();
    await expect(homePage.popup).toBeVisible();
  });

  test('should add a new question', async () => {
    const initialCount = await homePage.getQuestionCount();
    await homePage.clickNewQuestion();
    // Assuming default selection or add selection logic
    await homePage.applyPopup();
    await expect(homePage.popup).not.toBeVisible();
    const newCount = await homePage.getQuestionCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should clear all questions', async () => {
    // Add a question first
    await homePage.clickNewQuestion();
    await homePage.applyPopup();
    expect(await homePage.getQuestionCount()).toBeGreaterThan(0);

    await homePage.clickClearQuestions();
    await expect(homePage.page.locator('.grid-item')).toHaveCount(0);
  });

  test('should save and load survey', async ({ page }) => {
    // Add a question
    await homePage.clickNewQuestion();
    await homePage.applyPopup();
    const countBeforeSave = await homePage.getQuestionCount();

    // Mock the save and load since it uses alert and prompt
    // In real test, might need to mock the API or handle dialogs
    await page.on('dialog', async dialog => {
      if (dialog.type() === 'alert') {
        await dialog.accept();
      } else if (dialog.type() === 'prompt') {
        await dialog.accept('test-id');
      }
    });

    await homePage.clickSaveSurvey();
    // Wait for alert

    await homePage.clickLoadSurvey();
    // Wait for alert

    const countAfterLoad = await homePage.getQuestionCount();
    expect(countAfterLoad).toBe(countBeforeSave);
  });

  test('should delete question by dragging to trash', async () => {
    // Add a question
    await homePage.clickNewQuestion();
    await homePage.applyPopup();
    expect(await homePage.getQuestionCount()).toBe(1);

    await homePage.dragQuestionToTrash(0);
    await expect(homePage.page.locator('.grid-item')).toHaveCount(0);
  });

  // Add more tests as needed
});
