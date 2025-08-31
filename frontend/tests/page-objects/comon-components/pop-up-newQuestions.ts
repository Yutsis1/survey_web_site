import { Page, Locator } from '@playwright/test';
import { PopupComponent } from './pop-up';

export class PopupNewQuestionComponent extends PopupComponent {
    readonly questionSelector: Locator;
    readonly questionText: Locator;

    constructor(page: Page, baseLocator?: Locator) {
        super(page, baseLocator);
        this.questionSelector = this.popupContent.getByTestId('radio-bar-question-type');
        this.questionText = this.popupContent.getByRole(
            'textbox',
            { name: 'Type the question…' }
        );
    }

}


