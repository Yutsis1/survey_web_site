# Test project
Test project with Playwright tests stored in frontend for fast debugging and fixing if locators or other elements change.

## Architecture

### Directory Structure
- **scenarios/** - Test specifications
  - `auth.spec.ts` - Authentication tests
  - `surveys.spec.ts` - Survey functionality tests

- **page-objects/** - Page Object Model pattern implementation
  - `authPage.ts` - Authentication page interactions
  - `surveys.ts` - Surveys page interactions
  - **common-components/** - Reusable UI component interactions
    - `pop-up.ts` - Generic pop-up interactions
    - `pop-up-newQuestions.ts` - New questions pop-up specific logic
    - `sidebar.ts` - Sidebar navigation interactions

- **mocks/** - Mock data and API responses
  - `backend.ts` - Backend service mocks

- **debug/** - Debugging utilities and helpers

## Pattern
Tests follow the Page Object Model pattern, separating test logic from page interactions and keeping locator definitions centralized for easier maintenance. 