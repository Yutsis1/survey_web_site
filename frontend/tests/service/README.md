# Service Tests

Tests that run with mocked backend responses.

## Overview

Service tests verify specific features with a mocked API backend. These tests don't require a running backend instance and provide fast, isolated test execution. They're ideal for testing UI behavior, user interactions, and component logic independently from backend implementation.

## Test Files

- `theme-toggle.spec.ts` - Theme switching functionality
- `surveys-load.spec.ts` - Survey loading and display

## Mocking Backend

All service tests use the mock backend defined in `mocks/backend.ts`. This file contains mock implementations of:
- Authentication endpoints
- Survey CRUD operations
- User profile endpoints
- All other API calls needed for tests

### Mock Setup

The mocks are automatically registered in Playwright configuration and intercept all requests matching `localhost:8000`.

```typescript
// Example: Mock responses are defined in mocks/backend.ts
// Tests automatically use these instead of real API calls
```

## Page Objects Used

### SurveyCreatorsPage
**Key Properties:**
- `newQuestionPopup` - Type-safe popup access
- `sidebar` - Navigation component

**Key Methods:**
- `clickNewQuestion()` - Open new question dialog
- `saveSurvey(name)` - Save current survey

### Component Objects
- **PopupComponent** - Base: `applyButton`, `closeButton`, `isVisible()`
- **PopupNewQuestionComponent** - `configureRadioBar()`, `configureTextInput()`, `configureCheckbox()`
- **SidebarComponent** - `clickNewQuestionButton()`, `clickSaveButton()`

## Running Service Tests

```bash
# All service tests (uses service config with mocked backend)
npx playwright test --config playwright.service.config.ts

# Specific service test
npx playwright test --config playwright.service.config.ts service/theme-toggle.spec.ts

# Debug mode
npx playwright test --config playwright.service.config.ts --debug

# UI mode
npx playwright test --config playwright.service.config.ts --ui

# By name pattern
npx playwright test --config playwright.service.config.ts -g "theme"

# View report
npx playwright show-report
```

## Writing Service Tests

### Basic Structure

```typescript
import { test, expect } from '@playwright/test';
import { SurveyCreatorsPage } from '../../page-objects/surveys';

test.describe('Survey Loading', () => {
  let surveyPage: SurveyCreatorsPage;
  
  test.beforeEach(async ({ page }) => {
    surveyPage = new SurveyCreatorsPage(page);
    await page.goto('http://localhost:3000/survey-creator');
  });
  
  test('should load survey from mocked backend', async () => {
    await test.step('Load survey', async () => {
      await surveyPage.loadSurveyPopup.selectSurvey('Test Survey');
      await expect(surveyPage.sidebar).toBeVisible();
    });
  });
});
```

### Benefits of Service Tests

- **Fast execution** - No API latency
- **Reliable** - Consistent mock responses
- **Isolated** - Test features independently
- **Network-resistant** - No network failures
- **Cheaper** - No test data cleanup needed

## Mock Data Management

Mock responses are centralized in `mocks/backend.ts`. To add new mocks:

1. Define the route and response in `mocks/backend.ts`
2. Use the same endpoint path in tests
3. Mocked requests will automatically use the defined response

## Best Practices

### Locators
- Prefer `data-testid` attributes for reliable selection
- Avoid CSS selectors dependent on styling

### Interactions
- Use `test.step()` for better test reports
- Chain locators for scoping: `popup.getByTestId('field')`

### Assertions
```typescript
// Good: Specific, meaningful assertions
await expect(surveyPage.sidebar).toBeVisible();
await expect(surveyPage.getPopup('theme')).toHaveText('Dark');

// Avoid: Too generic
await expect(page).not.toHaveTitle('');
```

### Wait Patterns
```typescript
// Wait for popup to close
await expect(popup.popupContent).not.toBeVisible();

// Wait for element with timeout
await expect(element).toBeVisible({ timeout: 5000 });
```

## Debugging Service Tests

```bash
# Run with debug UI
npx playwright test --config playwright.service.config.ts --debug

# View network tab to see mocked requests
# View console for logs
```

## When to Use Service vs Integration Tests

| Aspect | Service | Integration |
|--------|---------|-------------|
| Backend | Mocked | Real |
| Speed | Fast | Slower |
| Setup | None | DB setup needed |
| Isolation | High | Low |
| Use Case | Feature/UI tests | Full workflows |

---

**See also:** 
- [Main Overview](../INTEGRATION_TESTS_OVERVIEW.md)
- [Integration Tests](../integration/README.md)
- [POPUP-USAGE-EXAMPLES.md](../page-objects/POPUP-USAGE-EXAMPLES.md)
