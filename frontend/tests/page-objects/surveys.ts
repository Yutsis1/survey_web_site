import { Page, Locator } from '@playwright/test';
import { PopupComponent } from './common-components/pop-up';
import { SidebarComponent } from './common-components/sidebar';
import { PopupNewQuestionComponent } from './common-components/pop-up-newQuestions';
import { LoadSurveyPopup } from './common-components/pop-up-loadSurvey';

export class SurveyCreatorsPage {
  readonly page: Page;

  // Sidebar buttons
  readonly sidebar: SidebarComponent;

  // Main content
  readonly gridContainer: Locator;

  // Delete dropzone
  readonly deleteDropzone: Locator;

  // Cached popup instances
  private _newQuestionPopup?: PopupNewQuestionComponent;
  private _loadSurveyPopup?: LoadSurveyPopup;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = new SidebarComponent(page);
    this.gridContainer = page.locator('.grid-container');

    // Delete dropzone
    this.deleteDropzone = page.locator('.delete-dropzone-card');
  }

  /**
   * Get the New Question popup page object (type-safe)
   */
  get newQuestionPopup(): PopupNewQuestionComponent {
    if (!this._newQuestionPopup) {
      this._newQuestionPopup = new PopupNewQuestionComponent(this.page);
    }
    return this._newQuestionPopup;
  }

  /**
   * Get the Load Survey popup page object (type-safe)
   */
  get loadSurveyPopup(): LoadSurveyPopup {
    if (!this._loadSurveyPopup) {
      this._loadSurveyPopup = new LoadSurveyPopup(this.page);
    }
    return this._loadSurveyPopup;
  }

  /**
   * Deprecated: Use newQuestionPopup instead
   * @deprecated Use newQuestionPopup property for type-safe access
   */
  get popup(): PopupNewQuestionComponent {
    return this.newQuestionPopup;
  }

  /**
   * Factory method to get a popup by title (for dynamic access)
   * Returns base PopupComponent type - cast to specific type if needed
   * 
   * @param titleOrType - Can be popup title (e.g., "Load Survey") or type (e.g., "load-survey")
   * @returns PopupComponent instance (base class)
   * 
   * @example
   * ```typescript
   * // Using with title
   * const popup = surveyPage.getPopup('Load Survey');
   * await popup.applyButton.click();
   * 
   * // Using with type and casting
   * const loadPopup = surveyPage.getPopup('load-survey') as LoadSurveyPopup;
   * await loadPopup.selectSurvey('My Survey');
   * ```
   */
  getPopup(titleOrType: string): PopupComponent {
    const normalized = titleOrType.toLowerCase().trim();
    
    // Match by type or title
    if (normalized.includes('load') || normalized === 'load-survey') {
      return this.loadSurveyPopup;
    }
    
    if (normalized.includes('question') || normalized.includes('new') || normalized === 'new-question') {
      return this.newQuestionPopup;
    }
    
    // Default to generic popup component if no match
    console.warn(`No specific popup found for "${titleOrType}", returning generic PopupComponent`);
    return new PopupComponent(this.page);
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickNewQuestion() {
    await this.sidebar.clickNewQuestionButton();
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

  async saveSurvey(title: string) {
    await this.sidebar.addNameTextInput.fill(title);
    await this.clickSaveSurvey();
  }

  async loadSurvey(title: string) {
    await this.sidebar.loadSurveyButton.click();
    await this.loadSurveyPopup.selectSurvey(title);
    await this.applyPopup();
  }

  // Add more methods as needed for specific interactions
}
