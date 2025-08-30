import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Sidebar buttons
  readonly newQuestionButton: Locator;
  readonly clearQuestionsButton: Locator;
  readonly saveSurveyButton: Locator;
  readonly loadSurveyButton: Locator;

  // Main content
  readonly gridContainer: Locator;

  // Popup
  readonly popup: Locator;
  readonly popupTitle: Locator;
  readonly popupApplyButton: Locator;
  readonly popupCloseButton: Locator;

  // Delete dropzone
  readonly deleteDropzone: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar
    this.newQuestionButton = page.locator('[data-testid="button-1"]');
    this.clearQuestionsButton = page.locator('[data-testid="button-2"]');
    this.saveSurveyButton = page.locator('[data-testid="button-save"]');
    this.loadSurveyButton = page.locator('[data-testid="button-load"]');

    // Grid
    this.gridContainer = page.locator('.grid-container');

    // Popup
    this.popup = page.locator('.popup'); // Assuming class name
    this.popupTitle = page.locator('.popup-title'); // Assuming
    this.popupApplyButton = page.locator('.popup-apply'); // Assuming
    this.popupCloseButton = page.locator('.popup-close'); // Assuming

    // Delete dropzone
    this.deleteDropzone = page.locator('.delete-dropzone-card');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickNewQuestion() {
    await this.newQuestionButton.click();
  }

  async clickClearQuestions() {
    await this.clearQuestionsButton.click();
  }

  async clickSaveSurvey() {
    await this.saveSurveyButton.click();
  }

  async clickLoadSurvey() {
    await this.loadSurveyButton.click();
  }

  async isPopupOpen(): Promise<boolean> {
    return await this.popup.isVisible();
  }

  async applyPopup() {
    await this.popupApplyButton.click();
  }

  async closePopup() {
    await this.popupCloseButton.click();
  }

  async getQuestionCount(): Promise<number> {
    return await this.page.locator('.grid-item').count();
  }

  async dragQuestionToTrash(questionIndex: number) {
    const question = this.page.locator('.grid-item').nth(questionIndex);
    const dragHandle = question.locator('.drag-handle');

    // Simulate drag to trash
    await dragHandle.dragTo(this.deleteDropzone);
  }

  // Add more methods as needed for specific interactions
}
