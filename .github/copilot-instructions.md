# GitHub Copilot Custom Instructions

You are an AI assistant helping develop the Survey Web Site project. Follow these guidelines when generating code or providing assistance.

## Project Context

**Survey Web Site**: A full-stack survey application with a Next.js frontend and FastAPI backend. Uses MongoDB for survey data and PostgreSQL for authentication.

- **Frontend**: Next.js 16+ with React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI with Python 3.9+
- **Databases**: MongoDB (surveys) & PostgreSQL (auth)

## Code Style & Standards

### Frontend (TypeScript/React)

1. **File Extensions & Locations**
   - Use `.tsx` for React components with JSX
   - Use `.ts` for utilities and type definitions
   - Place components in `src/components/` or feature-specific modules in `src/app-modules/`

2. **Component Best Practices**
   - Write functional components only
   - Use React hooks for state management
   - Fully type component props with interfaces/types
   - Use named exports for components
   - Example:
     ```typescript
     interface SurveyCardProps {
       id: string;
       title: string;
       description?: string;
     }
     
     export function SurveyCard({ id, title, description }: SurveyCardProps) {
       return <div>{/* component JSX */}</div>;
     }
     ```

3. **Naming Conventions**
   - Components: PascalCase (e.g., `SurveyForm.tsx`, `QuestionList.tsx`)
   - Functions/Variables: camelCase (e.g., `formatDate.ts`, `calculateScore()`)
   - Constants: UPPER_SNAKE_CASE (e.g., `MAX_SURVEY_LENGTH`, `DEFAULT_TIMEOUT`)
   - Types/Interfaces: PascalCase with `.types.ts` suffix (e.g., `survey.types.ts`)

4. **Validation & Configuration**
   - Use Zod for runtime validation (imported from config files)
   - API config in `src/config/index.ts` is validated via Zod
   - Environment variables use `NEXT_PUBLIC_*` prefix for client-side access only

5. **Styling**
   - Use Tailwind CSS utility classes exclusively
   - Avoid inline styles or CSS modules unless absolutely necessary
   - Follow mobile-first responsive design patterns

6. **API Integration**
   - Create services in `src/services/` for API calls
   - Use the config-defined `apiUrl` for all backend requests
   - Always handle errors and loading states
   - Return typed responses matching backend models

7. **Testing**
   - Write unit tests alongside components: `ComponentName.test.tsx`
   - Use Vitest for unit testing
   - Use Playwright for E2E tests in `tests/scenarios/`
   - Mock API responses using `tests/mocks/backend.ts`

### Backend (Python/FastAPI)

1. **File Organization**
   - Routes: `routers/` directory with one file per feature
   - Models: `models/api/` for request/response, `models/db/sql/` for DB schemas
   - Database logic: `db/mongo/` or `db/sql/` depending on the database
   - Utilities: Group in appropriate modules
   - Tests: Mirror source structure in `tests/`

2. **Naming Conventions**
   - Modules: snake_case (e.g., `survey_service.py`, `auth_router.py`)
   - Classes: PascalCase (e.g., `SurveyCreate`, `UserResponse`)
   - Functions/Variables: snake_case (e.g., `get_survey()`, `user_id`)
   - Constants: UPPER_SNAKE_CASE (e.g., `MAX_SURVEY_TITLE_LENGTH`)

3. **API Design**
   - Follow REST conventions (GET, POST, PUT, DELETE)
   - Use appropriate HTTP status codes
   - Tag endpoints in route handlers for OpenAPI documentation
   - Use Pydantic models for request/response validation
   - Example:
     ```python
     from fastapi import APIRouter, HTTPException
     from backend.models.api import SurveyCreate, SurveyResponse
     
     router = APIRouter(tags=["surveys"])
     
     @router.post("/surveys", response_model=SurveyResponse)
     async def create_survey(survey: SurveyCreate):
         # Implementation
         pass
     ```

4. **Database Operations**
   - MongoDB: Use `backend/db/mongo/` drivers for queries
   - PostgreSQL: Use `backend/db/sql/` for auth operations
   - Always use async/await patterns
   - Handle database errors gracefully

5. **Dependency Injection**
   - Use FastAPI's `Depends()` for common operations
   - Centralize database connections and authentication checks
   - Keep routes clean and focused on business logic

6. **Error Handling**
   - Use FastAPI exceptions (`HTTPException`, `RequestValidationError`)
   - Custom error middleware in `backend/middleware/error_handling.py`
   - Return meaningful error messages with appropriate status codes

7. **Type Hints**
   - Always use type hints for function parameters and returns
   - Use `Optional[Type]` for nullable values
   - Use `List[Type]` or `Dict[str, Type]` for collections

8. **Testing**
   - Write tests in `backend/tests/` mirroring source structure
   - Test both successful and error scenarios
   - Mock database calls where appropriate

## Common Patterns

### Frontend
- **State Management**: Use React Context for global state, local state with `useState` for components
- **API Calls**: Abstract in service layer, use `useEffect` for side effects
- **Loading States**: Always show loading indicators during async operations
- **Error Handling**: Display user-friendly error messages, log errors to console

### Backend
- **Startup Tasks**: Use lifespan context manager in `main.py` for migrations and initialization
- **Async Pattern**: Use `async def` for all route handlers
- **Validation**: Validate all inputs with Pydantic models at route boundaries
- **Logging**: Use Python's logging module for debugging and monitoring

## Development Workflow

1. **Before Making Changes**
   - Check existing patterns in similar files
   - Follow the established directory structure
   - Review related tests to understand expected behavior

2. **When Adding Features**
   - Create both backend and frontend changes
   - Add tests for new functionality
   - Update relevant type definitions
   - Include proper error handling

3. **When Fixing Bugs**
   - Add a test that reproduces the bug first
   - Fix the bug while keeping the test passing
   - Check for similar issues elsewhere in codebase

4. **Code Quality**
   - Ensure no unused imports
   - Follow consistent indentation (2 spaces frontend, 4 spaces backend)
   - Keep functions focused and single-responsibility
   - Add comments only for non-obvious logic

## Tools & Debugging

- **Frontend**: Use browser DevTools, Playwright inspector (`playwright test --debug`)
- **Backend**: Use FastAPI docs at `/swagger`, Python debugger (pdb), VS Code Python extension
- **Database**: Connect directly to MongoDB/PostgreSQL for inspection if needed

## Important Files to Reference

- Frontend config: `frontend/src/config/index.ts`
- Backend main: `backend/main.py`
- README: `README.md` for setup instructions
- Docker setup: `docker-compose.yml` for local development

## When You're Uncertain

1. Check similar existing code in the repository
2. Review the README and documentation files or other .md files in folders scopes 
3. Look at test files to understand expected behavior
4. Ask clarifying questions about requirements or constraints
