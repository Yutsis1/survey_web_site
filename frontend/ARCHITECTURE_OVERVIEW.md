# Frontend Architecture Overview

This document describes the current architecture of the `frontend` application.

## Tech Stack

- Framework: Next.js 16 (App Router) + React 19 + TypeScript
- Styling: Tailwind CSS + CSS variables (`src/app/globals.css`)
- UI primitives: Radix UI based components in `src/components/ui`
- Forms/validation: Zod (used in auth validation)
- Data viz: Recharts (dashboard charts)
- Interaction/layout: `react-grid-layout` (survey builder canvas)
- Tests:
  - Unit/component: Vitest + Testing Library
  - Integration: Playwright
  - Component development: Storybook (`@storybook/nextjs-vite`)

## High-Level Structure

- `src/app`: App Router pages, feature modules, auth context, services, app-specific components.
- `src/components/ui`: Shared design-system-style UI primitives (`button`, `card`, `input`, `tabs`, etc.).
- `src/config`: Runtime environment parsing and API base URL selection.
- `tests`: Playwright Integration tests using Page Object Model.

## Routing and Shell

Main routes:

- `/` -> redirect logic based on auth state (`src/app/page.tsx`)
- `/auth` -> login/register page (`src/app/auth/page.tsx`)
- `/dashboard` -> analytics dashboard (`src/app/dashboard/page.tsx`)
- `/survey-builder` -> survey authoring experience (`src/app/survey-builder/page.tsx`)
- `/survey/[id]` -> public survey response page (`src/app/survey/[id]/page.tsx`)
- `/api/proxy/[...path]` -> server-side proxy to backend API (`src/app/api/proxy/[...path]/route.ts`)

Global layout:

- `src/app/layout.tsx` wraps the app with:
  - `AuthProvider` (auth/session state)
  - `AuthGuard` (currently pass-through)
  - `AppShell` (top navigation + mobile menu)
- `AppShell` hides navigation for `/auth` and `/survey/*`, showing app nav only for authenticated app pages.

## State and Domain Model

State management is intentionally lightweight:

- Global state: `AuthProvider` context (`src/app/contexts/auth-context.tsx`)
- Feature state: local `useState` and custom hooks
  - `useQuestionBuilder` for question draft config
  - `useLayouts` for grid layout state
- No Redux/Zustand; state is colocated with feature modules.

Domain models are typed with interfaces in service/module files, including:

- Survey definition (`QuestionItem`, `SurveyPayload`, `SurveyResponse`)
- Survey responses (`SurveyAnswer`, `StoredSurveyResponse`)
- Dashboard analytics DTOs (`DashboardData`, `DashboardSurveyAnalytics`)

## Data Access and API Integration

### API base URL strategy

`src/config/index.ts` chooses base URL by runtime:

- Server-side: `API_URL` (validated with Zod)
- Client-side: `/api/proxy`

This allows browser requests to stay same-origin while server route handlers forward to backend.

### Proxy layer

`src/app/api/proxy/[...path]/route.ts`:

- Supports `GET/POST/PUT/DELETE/PATCH`
- Forwards query params and selected headers (`authorization`, `cookie`, etc.)
- Returns backend status/body transparently
- Adds categorized error responses for network/timeout/internal failures

### Client service layer

`src/app/services` holds API calls and data shaping:

- `api-client.ts`: thin wrapper that injects bearer token + handles 401
- `surveys.ts`: create/update/fetch surveys + option fallback behavior
- `survey-responses.ts`: public survey fetch + submit/fetch responses
  - Includes localStorage fallback if response endpoints are unavailable
- `dashboard.ts`: composes survey + response data into dashboard analytics view model

## Authentication Flow

`AuthProvider` responsibilities:

- Session bootstrap via `/auth/refresh`
- Access token + expiry tracking in memory
- Pre-expiry token refresh timer
- Login/register/logout methods exposed via context
- Initializes `apiClient` with token accessor + unauthorized callback

Routing behavior:

- Pages enforce redirect behavior themselves (`/`, `/auth`, `/dashboard`, `/survey-builder`)
- `ProtectedRoute` exists but primary guarding is done inside page components

## Feature Modules

### Survey Builder (`/survey-builder`)

Implemented as modular composition:

- `app-modules/questions`: question types, factory, defaults, builder hook
- `app-modules/grid`: responsive drag/resize grid container
- `app-modules/pop-up`: question creation and load-survey dialogs
- `app-modules/sidebar`: command actions (new, clear, save, load, logout)
- `components/dynamic-component-renderer.tsx`: renders question by component key
- `components/interfaceMapping.tsx`: type-safe mapping between question type and component props

Flow:

1. User configures question in popup.
2. Factory creates typed `QuestionItem`.
3. Item is appended to grid layout state.
4. Save/load operations persist/retrieve survey via services.

### Dashboard (`/dashboard`)

- Fetches aggregated view model from `fetchDashboardData()`
- Displays KPI cards, survey table, trend chart, completion progress, and per-question breakdown charts.

### Public Survey (`/survey/[id]`)

- Loads survey schema by ID
- Builds answer state map by question type
- Reuses dynamic renderer to display interactive questions
- Submits answers through `submitSurveyResponse()`

## UI and Styling Architecture

- Tailwind utilities + CSS custom properties define theme tokens.
- Design primitives in `src/components/ui` centralize common UI behavior.
- Feature-specific styling in:
  - `src/app/styles.css`
  - `src/app/app-modules/grid/responsive-grid-layout.css`
- Global background/theme behavior defined in `src/app/globals.css`.

## Testing and Quality

- Unit/component tests: colocated `*.test.ts(x)` in `src/app/**`
- Vitest config:
  - `jsdom` environment
  - setup: `src/app/setupTests.ts`
  - excludes Playwright folders
- E2E tests: `tests/` with Page Object Model (`tests/page-objects/**`)
- Storybook stories: colocated `*.stories.tsx` across `src/**`
- Lint/prettier hooks via Husky + lint-staged.

## Build and Runtime

- Local dev: `npm run dev` (Next.js with Turbopack)
- Production build: `npm run build` / `npm run start`
- Docker: multi-stage build in `frontend/Dockerfile`
  - install deps
  - build app
  - run production Next.js server on port `3000`

## Current Architectural Characteristics

- Strong feature modularization around survey creation/respond/analyze workflows.
- Thin but clear service layer between UI and backend APIs.
- Type-driven component rendering for dynamic survey questions.
- Context + local hooks keep state management simple and maintainable.
- Proxy-based API strategy reduces CORS/session friction for browser clients.
