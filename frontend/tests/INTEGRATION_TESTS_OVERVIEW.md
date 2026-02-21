# E2E Test Architecture

Playwright-based test suite using Page Object Model pattern for maintainable E2E testing.

## Technology Stack
- **Framework**: Playwright + TypeScript
- **Pattern**: Page Object Model + Component Objects
- **Principles**: Test isolation, component composition, centralized locators

---

## Directory Structure

```
tests/
├── scenarios/              # Test specs
│   ├── auth.spec.ts
│   └── surveys/
│       ├── surveys-create.spec.ts
│       └── surveys-update.spec.ts
├── page-objects/          # Page Object Model
│   ├── authPage.ts
│   ├── surveys.ts
│   └── common-components/ # Reusable components
│       ├── pop-up.ts
│       ├── pop-up-newQuestions.ts
│       ├── pop-up-loadSurvey.ts
│       └── sidebar.ts
├── defults/               # Test data & constants
│   └── defaultObjects.ts
├── debug/                 # Debugging utilities (empty)
└── mocks/                 # API mocks (planned)
```

---

## Design Patterns

### Page Object Model
```typescript
export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  
  constructor(page: Page) {
    this.emailInput = page.getByTestId('input-email');
  }
  
  async fillLoginForm(email: string, password: string) { }
}
```

### Component Objects
```
PopupComponent (base)
├── PopupNewQuestionComponent
└── LoadSurveyPopup
```

### Factory Pattern
```typescript
// Type-safe (recommended)
surveyPage.newQuestionPopup.configureRadioBar({...});

// Dynamic
const popup = surveyPage.getPopup('Load Survey');
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|----------|
| Test specs | `{feature}-{action}.spec.ts` | `surveys-create.spec.ts` |
| Page objects | `{PageName}Page` | `AuthPage`, `SurveyCreatorsPage` |
| Components | `{Component}Component` | `PopupComponent`, `SidebarComponent` |
| Methods | `click{Element}()`, `get{Element}()` | `clickNewQuestion()` |
| Variables | `{feature}Page` | `authPage`, `surveyPage` |

---

## Core Page Objects

### AuthPage
**Key Methods:**
- `fillLoginForm(email, password)`
- `fillRegisterAuthForm(email, password, repeat)`
- `waitUntilReady()`

### SurveyCreatorsPage
**Key Properties:**
- `newQuestionPopup` - Type-safe popup access
- `loadSurveyPopup` - Load survey popup
- `sidebar` - Navigation component

**Key Methods:**
- `clickNewQuestion()`, `saveSurvey(name)`, `getPopup(type)`

### Component Objects
- **PopupComponent** - Base: `applyButton`, `closeButton`, `isVisible()`
- **PopupNewQuestionComponent** - `configureRadioBar()`, `configureTextInput()`, `configureCheckbox()`
- **LoadSurveyPopup** - `selectSurvey(name)`, `getAvailableSurveys()`
- **SidebarComponent** - `clickNewQuestionButton()`, `clickSaveButton()`

---

## Writing Tests

### Test Structure
```typescript
test.describe('Feature', () => {
  let pageObject: PageClass;
  
  test.beforeEach(async ({ page }) => {
    pageObject = new PageClass(page);
    await pageObject.goto();
  });
  
  test('should do something', async () => {
    await test.step('Step description', async () => {
      // Arrange, Act, Assert
    });
  });
});
```

### Using Default Objects
```typescript
import { defaultObjects } from '../../defults/defaultObjects';

await authPage.fillLoginForm(
  defaultObjects.user.email, 
  defaultObjects.user.password
);
```

---

## Best Practices

| Category | Guideline |
|----------|-----------|
| **Locators** | Prefer `data-testid`, avoid styling-dependent CSS |
| **Waits** | Use explicit waits with timeouts, avoid hardcoded delays |
| **Isolation** | Each test independent, unique data (`test_${Date.now()}@...`) |
| **Reusability** | Extract common flows to page object methods |
| **Debugging** | Use `--debug`, `.pause()`, check `test-results/` |

### Quick Tips
- Define timeout constants: `const AUTH_TIMEOUT = 15000;`
- Use `test.step()` for better reporting
- Wait for popups to close: `await expect(popup.popupContent).not.toBeVisible();`
- Chain locators for scoping: `authBox.getByTestId('input-email')`

---

## Running Tests

```bash
npx playwright test                        # All tests
npx playwright test scenarios/auth.spec.ts # Specific file
npx playwright test --debug                # Debug mode
npx playwright test --ui                   # UI mode
npx playwright test -g "login"             # By name
npx playwright show-report                 # View report
```

---

**See also:** [POPUP-USAGE-EXAMPLES.md](page-objects/POPUP-USAGE-EXAMPLES.md) for detailed popup patterns.
