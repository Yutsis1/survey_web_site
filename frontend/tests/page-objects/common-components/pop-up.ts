import { Page, Locator } from '@playwright/test';

export class PopupComponent {
  readonly page: Page;
  readonly baseLocator: Locator;
  readonly popupContent: Locator;
  readonly bottomButtonsContainer: Locator;

  constructor(page: Page, baseLocator?: Locator) {
    this.page = page;
    this.baseLocator = baseLocator ?? page.locator('div.popup-overlay');
    this.popupContent = this.baseLocator.locator('div.popup-content');
    this.bottomButtonsContainer = this.baseLocator.locator('div.popup-buttons');
  }

  get applyButton(): Locator {
    return this.bottomButtonsContainer.getByTestId('apply-button');
  }

  get closeButton(): Locator {
    return this.bottomButtonsContainer.getByTestId('cancel-button');
  }

  async isVisible(): Promise<boolean> {
    return await this.baseLocator.isVisible();
  }
}