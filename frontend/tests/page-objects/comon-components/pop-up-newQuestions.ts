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
        question: 'Type the question…',
        activeLabel: 'Enter active label...',
        inactiveLabel: 'Enter inactive label...',
        fieldLabel: 'Enter field label...',
        placeholder: 'Enter placeholder text...',
        groupName: 'Enter group name...',
        toggleOptions: 'Example: Red,Green,Blue'
    };

    constructor(page: Page, baseLocator?: Locator) {
        super(page, baseLocator);
        this.questionSelector = this.popupContent.getByTestId('radio-bar-question-type');
        this.questionText = this.popupContent.getByRole(
            'textbox',
            { name: this.textFieldNames.question }
        );
    }

    get activeLabel() {
        return this.popupContent.getByRole('textbox', { name: this.textFieldNames.activeLabel });
    }
    get inactiveLabel() {
        return this.popupContent.getByRole('textbox', { name: this.textFieldNames.inactiveLabel });
    }
    get fieldLabel() {
        return this.popupContent.getByRole('textbox', { name: this.textFieldNames.fieldLabel });
    }
    get groupName() {
        return this.popupContent.getByRole('textbox', { name: this.textFieldNames.groupName });
    }
    get options() {
        return this.popupContent.getByRole('textbox', { name: this.textFieldNames.toggleOptions });
    }

    selectRadioButton(value: string) {
        return this.questionSelector.getByRole('radio', { name: value }).check();
    }

    writeInTextField(value: string, textFieldName: string) {
        return this.popupContent.getByRole(
            'textbox',
            { name: textFieldName }
        ).fill(value);
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
            const checkbox = this.popupContent.locator('#checkbox-default-state');
            if (config.defaultState) {
                await checkbox.check();
            } else {
                await checkbox.uncheck();
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


