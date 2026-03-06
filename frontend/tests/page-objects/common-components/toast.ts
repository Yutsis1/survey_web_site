import { Page, Locator } from '@playwright/test';

/**
 * Toast Component - handles toast notification interactions in tests
 */
export class ToastComponent {
  readonly page: Page;
  readonly viewport: Locator;

  constructor(page: Page) {
    this.page = page;
    this.viewport = page.locator('[data-testid="toast-viewport"]');
  }

  /**
   * Get a toast by type
   * @param type - The toast type: 'error' | 'info' | 'warning' | 'success'
   */
  getToast(type: 'error' | 'info' | 'warning' | 'success'): Locator {
    return this.page.locator(`[data-testid="toast-banner-${type}"]`);
  }

  /**
   * Get any visible toast (first one)
   */
  getAnyToast(): Locator {
    return this.page.locator('[data-toast-type]').first();
  }

  /**
   * Get toast title text
   */
  async getToastTitle(type?: 'error' | 'info' | 'warning' | 'success'): Promise<string> {
    const toast = type ? this.getToast(type) : this.getAnyToast();
    const title = toast.locator('.text-sm.font-semibold.leading-5');
    return await title.textContent() || '';
  }

  /**
   * Get toast description text
   */
  async getToastDescription(type?: 'error' | 'info' | 'warning' | 'success'): Promise<string> {
    const toast = type ? this.getToast(type) : this.getAnyToast();
    const description = toast.locator('.text-xs.text-current\\/90');
    return await description.textContent() || '';
  }

  /**
   * Check if a toast is visible
   */
  async isToastVisible(type?: 'error' | 'info' | 'warning' | 'success'): Promise<boolean> {
    const toast = type ? this.getToast(type) : this.getAnyToast();
    return await toast.isVisible();
  }

  /**
   * Wait for a toast to appear
   */
  async waitForToast(type?: 'error' | 'info' | 'warning' | 'success', timeout: number = 5000): Promise<void> {
    const toast = type ? this.getToast(type) : this.getAnyToast();
    await toast.waitFor({ state: 'visible', timeout });
  }

  /**
   * Close a toast by clicking the close button
   */
  async closeToast(type?: 'error' | 'info' | 'warning' | 'success'): Promise<void> {
    const toast = type ? this.getToast(type) : this.getAnyToast();
    const closeButton = toast.locator('button[aria-label="Close notification"]');
    await closeButton.click();
  }

  /**
   * Wait for all toasts to disappear
   */
  async waitForToastsToDisappear(timeout: number = 5000): Promise<void> {
    await this.page.locator('[data-toast-type]').first().waitFor({ state: 'hidden', timeout });
  }
}
