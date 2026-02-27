import { Page, Locator, expect } from '@playwright/test';
import { PopupComponent } from './pop-up';

export class PopupNewQuestionComponent extends PopupComponent {
    readonly questionSelector: Locator;
    readonly questionText: Locator;
    // put the name 
    readonly questionTypes = {
        textInput: "TextInput",
        checkbox: "Checkbox",
        radioBar: "RadioBar",
        dropDown: "DropDown",
        checkboxTiles: "CheckboxTiles"
    };

    readonly textFieldNames = {
        question: 'questionText',
        activeLabel: 'activeLabel',
        inactiveLabel: 'inactiveLabel',
        fieldLabel: 'fieldLabel',
        placeholder: 'placeholderText',
        groupName: 'groupName',
        toggleOptions: 'optionsList',
        dropDownOptions: 'dropDownOptionsList',
        dropDownDefaultOption: 'dropDownDefaultOption',
        checkboxTilesName: 'checkboxTilesGroupName',
        checkboxTilesOptions: 'checkboxTilesOptionsList'
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
        // Updated to use switch role instead of label with input
        return this.popupContent.getByRole('switch');
    }

    async selectRadioButton(value: string) {
        return await this.questionSelector.getByRole('radio', { name: value }).click();
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

    async configureDropDown(config: {
        questionText?: string;
        options?: string[];
        defaultOption?: string;
    }) {
        await this.selectRadioButton(this.questionTypes.dropDown);

        if (config.questionText) {
            await this.writeInTextField(config.questionText, this.textFieldNames.question);
        }
        if (config.options && config.options.length > 0) {
            // Find the Options section - the first one is for RadioBar, so get the second one for DropDown
            const allOptionsLabels = this.popupContent.locator('label:has-text("Options")');
            // Get the parent container of the last "Options" label (which is DropDown if we just selected it)
            const optionsContainer = allOptionsLabels.last().locator('..');
            
            // Fill first option
            const firstInput = optionsContainer.locator('input[type="text"]').first();
            await firstInput.fill(config.options[0]);

            // Fill additional options by clicking add button and filling new inputs
            for (let i = 1; i < config.options.length; i++) {
                const addButton = optionsContainer.locator('button:has-text("+ Add extra option")');
                await addButton.click();
                const inputs = optionsContainer.locator('input[type="text"]');
                await inputs.nth(i).fill(config.options[i]);
            }
        }
        if (config.defaultOption) {
            const defaultSelect = this.popupContent.locator(
                `select[name="${this.textFieldNames.dropDownDefaultOption}"]`
            );
            await expect(defaultSelect.locator(`option[value="${config.defaultOption}"]`)).toHaveCount(1);
            await defaultSelect.selectOption({ value: config.defaultOption });
        }
    }

    // CheckboxTiles configuration methods
    async configureCheckboxTiles(config: {
        questionText?: string;
        name?: string;
        options?: string[];
    }) {
        await this.selectRadioButton(this.questionTypes.checkboxTiles);

        if (config.questionText) {
            await this.writeInTextField(config.questionText, this.textFieldNames.question);
        }
        if (config.name) {
            await this.writeInTextField(config.name, this.textFieldNames.checkboxTilesName);
        }
        if (config.options && config.options.length > 0) {
            // Find the Options section - using the last "Options" label for CheckboxTiles
            const optionsContainer = this.popupContent
                .locator('label:has-text("Options")')
                .last()
                .locator('..');
            
            // Fill first option
            const firstInput = optionsContainer.locator('input[type="text"]').first();
            await firstInput.fill(config.options[0]);

            // Fill or add additional options
            for (let i = 1; i < config.options.length; i++) {
                const inputs = optionsContainer.locator('input[type="text"]');
                const currentCount = await inputs.count();
                
                if (i < currentCount) {
                    // Input already exists, just fill it
                    await inputs.nth(i).fill(config.options[i]);
                } else {
                    // Need to add a new input by clicking the add button
                    const addButton = optionsContainer.locator('button:has-text("+ Add extra option")');
                    await addButton.click();
                    // Refetch and fill the new input
                    const updatedInputs = optionsContainer.locator('input[type="text"]');
                    await updatedInputs.nth(i).fill(config.options[i]);
                }
            }
        }
    }

}


