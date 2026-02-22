# Integration Tests

Tests that run against a real backend instance.

## Overview

Integration tests verify the full E2E workflow with actual backend API calls. These tests require the backend to be running and connect to real databases.

## Test Files

- `auth.spec.ts` - Authentication flows (login, register, logout)
- `surveys/surveys-create.spec.ts` - Survey creation workflows
- `surveys/surveys-update.spec.ts` - Survey update workflows

## Page Objects Used

### AuthPage
**Key Methods:**
- `fillLoginForm(email, password)` - Log in user
- `fillRegisterAuthForm(email, password, repeat)` - Register new user
- `waitUntilReady()` - Wait for page to load

### SurveyCreatorsPage
**Key Properties:**
- `newQuestionPopup` - Type-safe popup access
- `loadSurveyPopup` - Load survey popup
- `sidebar` - Navigation component

**Key Methods:**
- `clickNewQuestion()` - Open new question dialog
- `saveSurvey(name)` - Save current survey
- `getPopup(type)` - Get popup by type

### Component Objects
- **PopupComponent** - Base: `applyButton`, `closeButton`, `isVisible()`
- **PopupNewQuestionComponent** - `configureRadioBar()`, `configureTextInput()`, `configureCheckbox()`
- **LoadSurveyPopup** - `selectSurvey(name)`, `getAvailableSurveys()`
- **SidebarComponent** - `clickNewQuestionButton()`, `clickSaveButton()`

## Running Integration Tests

```bash
# All integration tests
npx playwright test

# Specific file
npx playwright test integration/auth.spec.ts

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# By name pattern
npx playwright test -g "login"

# View report
npx playwright show-report
```

## Setup Requirements

- Backend API running (typically on `http://localhost:8000`)
- MongoDB connected and ready
- PostgreSQL connected and ready
- Frontend dev server running

## Best Practices

### Test Isolation
- Each test should be independent
- Use unique data for each test run (e.g., `test_${Date.now()}@example.com`)
- Clean up resources after tests complete

### Waits & Timeouts
- Use explicit waits with timeouts, avoid hardcoded delays
- Define timeout constants: `const AUTH_TIMEOUT = 15000;`

### Locators
- Prefer `data-testid` attributes
- Avoid styling-dependent CSS selectors

### Debugging
```typescript
// Pause execution at specific point
await page.pause();

// Screenshot for debugging
await page.screenshot({ path: 'debug.png' });

// Check test-results folder for detailed logs
```

## Using Test Data

Import default test objects:

```typescript
import { defaultObjects } from '../../defults/defaultObjects';

await authPage.fillLoginForm(
  defaultObjects.user.email, 
  defaultObjects.user.password
);
```

---

**See also:** 
- [Main Overview](../INTEGRATION_TESTS_OVERVIEW.md)
- [Service Tests](../service/README.md)
- [POPUP-USAGE-EXAMPLES.md](../page-objects/POPUP-USAGE-EXAMPLES.md)
