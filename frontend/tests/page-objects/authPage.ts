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
        this.emailInput = this.authBox.getByTestId('input-email').locator('input');
        this.passwordInput = this.authBox.getByTestId('input-password').locator('input');
        this.repeatPasswordInput = this.authBox.getByTestId('input-repeat-password').locator('input');
        this.submitButton = this.authBox.getByTestId('auth-submit');
        this.modeToggle = this.authBox.getByTestId('toggle-mode');
    }

    getInfoLabel(text: string, type: 'info' | 'warning' | 'error'): Locator {
        return this.authBox.locator(`label[data-testid=info-${type}]`, { hasText: text });
    }

    async goto() {
        await this.page.goto('/auth');
    }

    async fillLoginForm(email: string, password: string) {
        if (await this.repeatPasswordInput.isVisible()) {
            await this.modeToggle.click(); // switch to login mode if in register mode
        }
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }
    async fillRegisterAuthForm(email: string, password: string, repeatPassword: string) {
        if (!(await this.repeatPasswordInput.isVisible())) {
            await this.modeToggle.click();
        }
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.repeatPasswordInput.fill(repeatPassword);
        await this.submitButton.click();
    }
}
