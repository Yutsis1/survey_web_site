import { Page, Locator } from '@playwright/test';
import { PopupComponent } from './pop-up';

export class LoadSurveyPopup extends PopupComponent {
  readonly dropdown: Locator;
  readonly dropdownLabel: Locator;
  readonly loadingMessage: Locator;
  readonly errorMessage: Locator;
  readonly noSurveysMessage: Locator;

  constructor(page: Page, baseLocator?: Locator) {
    super(page, baseLocator);
    this.dropdown = this.popupContent.locator('select#saved-surveys');
    this.dropdownLabel = this.popupContent.locator('label[for="saved-surveys"]');
    this.loadingMessage = this.popupContent.locator('p:has-text("Loading surveys")');
    this.errorMessage = this.popupContent.locator('p:not(:has-text("Loading surveys")):not(:has-text("No surveys available"))');
    this.noSurveysMessage = this.popupContent.locator('p:has-text("No surveys available")');
  }

  /**
   * Select a survey from the dropdown by visible text
   */
  async selectSurvey(surveyTitle: string): Promise<void> {
    await this.dropdown.selectOption({ label: surveyTitle });
  }

  /**
   * Select a survey from the dropdown by value/id
   */
  async selectSurveyById(surveyId: string): Promise<void> {
    await this.dropdown.selectOption({ value: surveyId });
  }

  /**
   * Get all available survey options from the dropdown
   */
  async getAvailableSurveys(): Promise<string[]> {
    const options = await this.dropdown.locator('option:not([value=""])').allTextContents();
    return options;
  }

  /**
   * Get the currently selected survey title
   */
  async getSelectedSurvey(): Promise<string> {
    const selectedOption = await this.dropdown.locator('option:checked').textContent();
    return selectedOption || '';
  }

  /**
   * Check if surveys are currently loading
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingMessage.isVisible();
  }

  /**
   * Check if the dropdown is disabled
   */
  async isDropdownDisabled(): Promise<boolean> {
    return await this.dropdown.isDisabled();
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible();
    if (isVisible) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Check if "No surveys available" message is shown
   */
  async hasNoSurveys(): Promise<boolean> {
    return await this.noSurveysMessage.isVisible();
  }

  /**
   * Wait for surveys to finish loading
   */
  async waitForSurveysToLoad(): Promise<void> {
    await this.loadingMessage.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Get the popup title
   */
  async getTitle(): Promise<string> {
    const titleLocator = this.popupContent.locator('h1.popup-title');
    return await titleLocator.textContent() || '';
  }

  /**
   * Get the popup description
   */
  async getDescription(): Promise<string> {
    const descriptionLocator = this.popupContent.locator('p.popup-description');
    return await descriptionLocator.textContent() || '';
  }
}
