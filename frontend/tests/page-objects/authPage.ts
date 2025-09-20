import { Page, Locator } from '@playwright/test';

export class AuthPage {
    readonly page: Page;

    readonly authBox: Locator;

    readonly emailInput: Locator;
    readonly passwordInput: Locator
    readonly repeatPasswordInput: Locator
    readonly submitButton: Locator;
    readonly modeToggle: Locator;


    constructor(page: Page) {
        this.page = page;
        this.authBox = page.locator('main.auth-box');
        this.emailInput = this.authBox.getByTestId('input-email');
        this.passwordInput = this.authBox.getByTestId('input-password');
        this.repeatPasswordInput = this.authBox.getByTestId('input-repeatPassword');
        this.submitButton = this.authBox.getByTestId('auth-submit');
        this.modeToggle = this.authBox.getByTestId('mode-toggle');
    }

    getInfoLabel(text: string, type: 'info' | 'warning' | 'error'): Locator {
        return this.authBox.locator(`label[data-testid=info-${type}]`, { hasText: text });
    }

    async goto() {
        await this.page.goto('/auth');
    }

    async loginAuth(email: string, password: string) {
        if (await this.repeatPasswordInput.isVisible()) {
            await this.modeToggle.click(); // switch to login mode if in register mode
        }
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }
    async registerAuth(email: string, password: string, repeatPassword: string) {
        if (!(await this.repeatPasswordInput.isVisible())) {
            await this.modeToggle.click();
        }
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.repeatPasswordInput.fill(repeatPassword);
        await this.submitButton.click();
    }
}
