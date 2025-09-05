import { Page, Locator } from '@playwright/test';
import { PopupComponent } from './pop-up';

export class PopupNewQuestionComponent extends PopupComponent {
    readonly questionSelector: Locator;
    readonly questionText: Locator;
    // put the name 
    readonly questionTypes = {
        textInput: "TextInput",
        checkbox: "Checkbox",
        radioBar: "RadioBar"
    };

    readonly textFieldNames = {
        question: 'questionText',
        activeLabel: 'activeLabel',
        inactiveLabel: 'inactiveLabel',
        fieldLabel: 'fieldLabel',
        placeholder: 'placeholderText',
        groupName: 'groupName',
        toggleOptions: 'optionsList'
    };

    constructor(page: Page, baseLocator?: Locator) {
        super(page, baseLocator);
        this.questionSelector = this.popupContent.getByTestId('radio-bar-question-type');
        this.questionText = this.popupContent.locator('input[name="questionText"]');
    }

    get activeLabel() {
        return this.popupContent.locator(`'input[name="${this.textFieldNames.activeLabel}"]'`);
    }
    get inactiveLabel() {
        return this.popupContent.locator(`'input[name="${this.textFieldNames.inactiveLabel}"]'`);
    }
    get fieldLabel() {
        return this.popupContent.locator(`'input[name="${this.textFieldNames.fieldLabel}"]'`);
    }
    get groupName() {
        return this.popupContent.locator(`'input[name="${this.textFieldNames.groupName}"]'`);
    }
    get toggleOptions() {
        return this.popupContent.locator(`'input[name="${this.textFieldNames.toggleOptions}"]'`);
    }
    get checkbox() {
        return this.popupContent.locator('label:has(input[name="defaultState"])');
    }

    async selectRadioButton(value: string) {
        return await this.questionSelector.getByRole('radio', { name: value }).check();
    }

    async writeInTextField(value: string, textFieldName: string) {
        return await this.popupContent.locator(`input[name="${textFieldName}"]`).fill(value);
    }

    // Checkbox configuration methods
    async configureCheckbox(config: {
        questionText?: string;
        activeLabel?: string;
        inactiveLabel?: string;
        defaultState?: boolean;
    }) {
        await this.selectRadioButton(this.questionTypes.checkbox);

        if (config.questionText) {
            await this.writeInTextField(config.questionText, this.textFieldNames.question);
        }
        if (config.activeLabel) {
            await this.writeInTextField(config.activeLabel, this.textFieldNames.activeLabel);
        }
        if (config.inactiveLabel) {
            await this.writeInTextField(config.inactiveLabel, this.textFieldNames.inactiveLabel);
        }
        if (config.defaultState !== undefined) {
            // Get current state by checking if the input is checked
            // the this.checkbox isn't working for that particular purpose. 
            const inputLocator = this.popupContent.locator('input[name="defaultState"]');
            const currentState = await inputLocator.isChecked();
            
            // Only click if we need to change the state
            if (config.defaultState !== currentState) {
                await this.checkbox.click();
            }
        }
    }

    // TextInput configuration methods
    async configureTextInput(config: {
        questionText?: string;
        fieldLabel?: string;
        placeholder?: string;
    }) {
        await this.selectRadioButton(this.questionTypes.textInput);

        if (config.questionText) {
            await this.writeInTextField(config.questionText, this.textFieldNames.question);
        }
        if (config.fieldLabel) {
            await this.writeInTextField(config.fieldLabel, this.textFieldNames.fieldLabel);
        }
        if (config.placeholder) {
            await this.writeInTextField(config.placeholder, this.textFieldNames.placeholder);
        }
    }

    // RadioBar configuration methods
    async configureRadioBar(config: {
        questionText?: string;
        groupName?: string;
        options?: string[];
    }) {
        await this.selectRadioButton(this.questionTypes.radioBar);

        if (config.questionText) {
            await this.writeInTextField(config.questionText, this.textFieldNames.question);
        }
        if (config.groupName) {
            await this.writeInTextField(config.groupName, this.textFieldNames.groupName);
        }
        if (config.options) {
            const optionsString = config.options.join(',');
            await this.writeInTextField(optionsString, this.textFieldNames.toggleOptions);
        }
    }

}


