# Popup Page Objects - Usage Guide

This guide demonstrates how to use the new generic popup factory pattern in your tests.

## Overview

The `SurveyCreatorsPage` now supports multiple popup types through:
- **Type-safe property accessors** (recommended for most cases)
- **Factory method** (for dynamic/parameterized scenarios)

## Available Popup Types

### 1. New Question Popup
- **Property**: `surveyPage.newQuestionPopup`
- **Legacy**: `surveyPage.popup` (deprecated, but still works)
- **Type**: `PopupNewQuestionComponent`

### 2. Load Survey Popup
- **Property**: `surveyPage.loadSurveyPopup`
- **Type**: `LoadSurveyPopup`

## Usage Examples

### Example 1: Type-Safe Property Access (Recommended)

```typescript
test('should load a survey using type-safe popup', async () => {
  const surveyPage = new SurveyCreatorsPage(page);
  
  // Click Load Survey button to open popup
  await surveyPage.clickLoadSurvey();
  
  // Access the Load Survey popup with full IntelliSense
  const loadPopup = surveyPage.loadSurveyPopup;
  
  // Wait for surveys to finish loading
  await loadPopup.waitForSurveysToLoad();
  
  // Get available surveys
  const surveys = await loadPopup.getAvailableSurveys();
  expect(surveys.length).toBeGreaterThan(0);
  
  // Select a survey
  await loadPopup.selectSurvey('My Test Survey');
  
  // Apply the selection
  await loadPopup.applyButton.click();
  
  // Verify popup closes
  await expect(loadPopup.popupContent).not.toBeVisible();
});
```

### Example 2: Factory Method (Dynamic Access)

```typescript
test('should handle popups dynamically by title', async () => {
  const surveyPage = new SurveyCreatorsPage(page);
  
  // Get popup by title
  const popup = surveyPage.getPopup('Load Survey');
  
  // Use base PopupComponent methods (available on all popups)
  await expect(popup.popupContent).toBeVisible();
  await popup.closeButton.click();
  
  // For type-specific methods, cast to the specific type
  const loadPopup = surveyPage.getPopup('load-survey') as LoadSurveyPopup;
  await loadPopup.selectSurvey('Another Survey');
});
```

### Example 3: Chained Operations

```typescript
test('should create and load survey with chained operations', async () => {
  const surveyPage = new SurveyCreatorsPage(page);
  
  // Create questions using the new question popup
  await surveyPage.clickNewQuestion();
  await surveyPage.newQuestionPopup.configureTextInput({
    questionText: 'What is your name?',
    fieldLabel: 'Name',
    placeholder: 'Enter your name'
  });
  await surveyPage.newQuestionPopup.applyButton.click();
  
  // Save the survey
  await surveyPage.saveSurvey('User Info Survey');
  
  // Load it back
  await surveyPage.clickLoadSurvey();
  await surveyPage.loadSurveyPopup.waitForSurveysToLoad();
  
  // Verify it appears in the list
  const surveys = await surveyPage.loadSurveyPopup.getAvailableSurveys();
  expect(surveys).toContain('User Info Survey');
  
  await surveyPage.loadSurveyPopup.selectSurvey('User Info Survey');
  await surveyPage.loadSurveyPopup.applyButton.click();
});
```

### Example 4: Error Handling and Loading States

```typescript
test('should handle loading states in Load Survey popup', async () => {
  const surveyPage = new SurveyCreatorsPage(page);
  
  await surveyPage.clickLoadSurvey();
  const loadPopup = surveyPage.loadSurveyPopup;
  
  // Check if loading
  if (await loadPopup.isLoading()) {
    // Wait for loading to complete
    await loadPopup.waitForSurveysToLoad();
  }
  
  // Check for errors
  const errorMessage = await loadPopup.getErrorMessage();
  if (errorMessage) {
    console.log('Error loading surveys:', errorMessage);
    await loadPopup.closeButton.click();
    return;
  }
  
  // Check if no surveys available
  if (await loadPopup.hasNoSurveys()) {
    console.log('No surveys available to load');
    await loadPopup.closeButton.click();
    return;
  }
  
  // Proceed with selection
  const surveys = await loadPopup.getAvailableSurveys();
  await loadPopup.selectSurvey(surveys[0]);
  await loadPopup.applyButton.click();
});
```

### Example 5: Legacy Compatibility

```typescript
test('should still work with legacy popup property', async () => {
  const surveyPage = new SurveyCreatorsPage(page);
  
  // Old way (still works, but deprecated)
  await surveyPage.clickNewQuestion();
  await surveyPage.popup.configureCheckbox({
    questionText: 'Do you agree?',
    activeLabel: 'Yes',
    inactiveLabel: 'No',
    defaultState: false
  });
  await surveyPage.applyPopup();
  
  // New way (recommended)
  await surveyPage.clickNewQuestion();
  await surveyPage.newQuestionPopup.configureCheckbox({
    questionText: 'Do you agree?',
    activeLabel: 'Yes',
    inactiveLabel: 'No',
    defaultState: false
  });
  await surveyPage.newQuestionPopup.applyButton.click();
});
```

## LoadSurveyPopup Available Methods

```typescript
class LoadSurveyPopup extends PopupComponent {
  // Selection methods
  selectSurvey(surveyTitle: string): Promise<void>
  selectSurveyById(surveyId: string): Promise<void>
  
  // Query methods
  getAvailableSurveys(): Promise<string[]>
  getSelectedSurvey(): Promise<string>
  getTitle(): Promise<string>
  getDescription(): Promise<string>
  getErrorMessage(): Promise<string | null>
  
  // State checks
  isLoading(): Promise<boolean>
  isDropdownDisabled(): Promise<boolean>
  hasNoSurveys(): Promise<boolean>
  
  // Wait methods
  waitForSurveysToLoad(): Promise<void>
  
  // Inherited from PopupComponent
  applyButton: Locator
  closeButton: Locator
  isVisible(): Promise<boolean>
}
```

## PopupNewQuestionComponent Available Methods

```typescript
class PopupNewQuestionComponent extends PopupComponent {
  // Configuration methods
  configureCheckbox(config: CheckboxConfig): Promise<void>
  configureTextInput(config: TextInputConfig): Promise<void>
  configureRadioBar(config: RadioBarConfig): Promise<void>
  
  // Low-level methods
  selectRadioButton(value: string): Promise<void>
  writeInTextField(value: string, fieldName: string): Promise<void>
  
  // Inherited from PopupComponent
  applyButton: Locator
  closeButton: Locator
  isVisible(): Promise<boolean>
}
```

## Migration Guide

### Before (Old Pattern)
```typescript
const surveyPage = new SurveyCreatorsPage(page);
await surveyPage.popup.configureTextInput({ ... });
```

### After (New Pattern)
```typescript
const surveyPage = new SurveyCreatorsPage(page);
await surveyPage.newQuestionPopup.configureTextInput({ ... });
// or
await surveyPage.popup.configureTextInput({ ... }); // Still works
```

## Best Practices

1. **Use type-safe properties** when you know the popup type at compile time
2. **Use the factory method** when popup type is determined at runtime
3. **Always wait for loading states** before interacting with dynamic content
4. **Check for errors** before proceeding with popup interactions
5. **Verify popup visibility** before and after operations
6. **Use specific popup methods** instead of generic locator queries when available

## Adding New Popup Types

To add support for a new popup type:

1. Create a new page object class extending `PopupComponent`:
   ```typescript
   // pop-up-myNewPopup.ts
   export class MyNewPopup extends PopupComponent {
     // Add popup-specific locators and methods
   }
   ```

2. Add a property getter in `SurveyCreatorsPage`:
   ```typescript
   private _myNewPopup?: MyNewPopup;
   
   get myNewPopup(): MyNewPopup {
     if (!this._myNewPopup) {
       this._myNewPopup = new MyNewPopup(this.page);
     }
     return this._myNewPopup;
   }
   ```

3. Update the `getPopup()` factory method to handle the new type:
   ```typescript
   getPopup(titleOrType: string): PopupComponent {
     const normalized = titleOrType.toLowerCase().trim();
     
     if (normalized.includes('mynew') || normalized === 'my-new-popup') {
       return this.myNewPopup;
     }
     // ... existing cases
   }
   ```

4. Document usage in this file!
