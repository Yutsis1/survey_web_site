import { Page, Locator } from '@playwright/test';
// import { PopupComponent } from './comon-components/pop-up';
import { SidebarComponent } from './comon-components/sidebar';
import { PopupNewQuestionComponent } from './comon-components/pop-up-newQuestions';

export class SurveyCreatorsPage {
  readonly page: Page;

  // Sidebar buttons
  readonly sidebar: SidebarComponent;

  // Main content
  readonly gridContainer: Locator;

  // Popup
  readonly popup: PopupNewQuestionComponent;

  // Delete dropzone
  readonly deleteDropzone: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = new SidebarComponent(page);
    this.popup = new PopupNewQuestionComponent(page);

    // Delete dropzone
    this.deleteDropzone = page.locator('.delete-dropzone-card');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickNewQuestion() {
    await this.sidebar.newQuestionButton.click();
  }

  async clickClearQuestions() {
    await this.sidebar.clearQuestionsButton.click();
  }

  async clickSaveSurvey() {
    await this.sidebar.saveSurveyButton.click();
  }

  async clickLoadSurvey() {
    await this.sidebar.loadSurveyButton.click();
  }

  async isPopupOpen(): Promise<boolean> {
    return await this.popup.isVisible();
  }

  async applyPopup() {
    await this.popup.applyButton.click();
  }

  async closePopup() {
    await this.popup.closeButton.click();
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
