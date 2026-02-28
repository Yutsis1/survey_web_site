# Pop-up Test Suite

This directory contains comprehensive tests for the PopUp component and related question builder functionality.

## Test Files

### 1. `pop-up.test.tsx`
Unit tests for the core PopUp component:
- Opening/closing behavior
- Button interactions (Apply, Cancel)
- Keyboard shortcuts (Escape key)
- Rendering with/without description
- Children rendering
- Disabled state handling
- CSS class applications

### 2. `pop-up-question-builder.test.tsx`
Integration tests for the question builder popup functionality:

#### Question Type Selection
- Tests rendering of all available question types (TextInput, Checkbox, RadioBar, DropDown)
- Tests switching between question types
- Tests type selector radio buttons

#### TextInput Question Configuration
- Renders field label and placeholder inputs
- Updates configuration when fields change

#### Checkbox Question Configuration
- Renders active/inactive label inputs
- Renders default state toggle
- Updates configuration when fields change

#### RadioBar Question Configuration
- Renders group name input
- Renders options list
- Tests adding new options
- Tests removing existing options
- Tests updating option values

#### DropDown Question Configuration
- Renders options list
- Renders default value selector
- Tests adding new options
- Tests removing existing options
- Tests automatic selection update when current option is deleted

#### Builder State Management
- Tests question text updates
- Tests configuration reset functionality
- Tests state persistence across type changes

## Running Tests

### Run all popup tests:
```bash
npm test -- pop-up
```

### Run specific test file:
```bash
npm test -- pop-up.test.tsx
npm test -- pop-up-question-builder.test.tsx
```

### Run tests in watch mode:
```bash
npm test
# Then press 'p' and type 'pop-up'
```

### Run tests with coverage:
```bash
npm test -- --coverage pop-up
```

## Test Coverage

The test suite covers:
- ✅ All 4 question types (TextInput, Checkbox, RadioBar, DropDown)
- ✅ Adding/removing options for RadioBar and DropDown
- ✅ State management through useQuestionBuilder hook
- ✅ UI interactions (button clicks, input changes)
- ✅ Edge cases (empty options, deleted selected option)
- ✅ Default values and resets

## Implementation Details

The tests use:
- **Vitest** for test runner and assertions
- **React Testing Library** for component rendering and interaction
- **@testing-library/react** hooks for testing custom hooks
- Mock functions for event handlers

## Related Components

- **PopUp Component**: `./pop-up.tsx`
- **Question Config**: `./pop-up-questions-config.tsx`
- **Question Builder Hook**: `../questions/question-builder.tsx`
- **Question Defaults**: `../questions/question-defaults.tsx`
- **Question Types**: `../questions/question-types.tsx`
