import { Page, Locator } from '@playwright/test';

export class SidebarComponent {
  readonly page: Page;
  readonly baseLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseLocator = page.locator('aside.sidebar');
  }

  getButtonLocatorByTestID(buttonId: string): Locator {
    return this.baseLocator.getByTestId(`"${buttonId}"`);

    // if getByTestId doesn't work, use this
    // return this.baseLocator.locator(`"[data-testid=${buttonId}]"`);
  }

  get newQuestionButton(): Locator {
    return this.getButtonLocatorByTestID('button-1');
  }

  get clearQuestionsButton(): Locator {
    return this.getButtonLocatorByTestID('button-2');
  }

  get saveSurveyButton(): Locator {
    return this.getButtonLocatorByTestID('button-save');
  }

  get loadSurveyButton(): Locator {
    return this.getButtonLocatorByTestID('button-load');
  }
}