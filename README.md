# Survey Web Site

A small personal project to learn building a survey application. The repo contains a Next.js frontend and a FastAPI backend that stores data in MongoDB.

## Requirements

- Node.js v22.8.0 or newer
- npm (bundled with Node.js) or an alternative package manager
- Python 3.9+ to run the backend locally
- MongoDB 8
- Docker (optional, for running the backend in a container or the full stack with Docker Compose)


## Getting started (frontend)

Install frontend dependencies:
The frontend now lives in the frontend/ directory. Change into it before running install commands:

```powershell
cd frontend
```

If you use a different package manager, run the appropriate install command from that directory (e.g. yarn install or pnpm install) before running the npm scripts.
```powershell
npm ci
```

Run the frontend:

- For development (hot-reload, if available):

```powershell
npm run dev
```

- To run the production build (if `start` is configured):

```powershell
npm start
```

If a `dev` script is not present you can use `npm start` as the project was previously using that command.

Running frontend with a stubbed backend (local mocks)

The frontend includes a stubbed mode that runs the Next.js app with a local mock server supplying predictable API responses. This is useful when the backend is unavailable or when developing UI components in isolation.

Commands:

```powershell
cd frontend
npm ci
npm run dev:stub
```

- `npm run dev:stub` starts Next.js plus a lightweight mock server that responds to frontend API requests.
- The mock responses used by the stub are kept under [frontend/tests/service/mocks](frontend/tests/service/mocks). If you introduce new API endpoints for the UI, add or update the corresponding mocks (for example `backend.ts`, `data.ts`, `next-api-handlers.ts`, or `server.ts`) so Storybook, unit tests, and integration tests have predictable stubs.
- To run the frontend against a real backend, set `NEXT_PUBLIC_API_URL` and run `npm run dev`.

Running frontend with Docker:

```powershell
cd frontend
docker build -t survey-frontend .
docker run -p 3000:3000 --env NEXT_PUBLIC_API_URL=http://localhost:8000 survey-frontend
```

Environment variables (frontend):

- `NEXT_PUBLIC_API_URL` — Base URL of the backend API (e.g. `http://localhost:8000`).
  The frontend uses this to issue `fetch` requests to the `/surveys` endpoints.

## Backend (FastAPI)

The backend lives in `backend/` and uses FastAPI. It expects a MongoDB database to store survey data.

Environment variables (backend):

- `MONGODB_URI` — MongoDB connection string (e.g. `mongodb://user:pass@host:port` or a MongoDB Atlas URI)
- `MONGODB_DB` — Database name to use

Running backend locally:

1. (Recommended) Create and activate a virtual environment.
2. Install dependencies and start the development server:

```powershell
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

The API will be available at `http://127.0.0.1:8000` by default.

Running backend with Docker:

```powershell
docker build -t survey-backend -f backend/Dockerfile .
docker run -p 8000:8000 --env MONGODB_URI="<your-uri>" --env MONGODB_DB="<db-name>" survey-backend
```

Replace `<your-uri>` and `<db-name>` with your MongoDB connection string and database name.

## Running with Docker Compose

To run the full stack (frontend, backend, and MongoDB) using Docker Compose:

1. Ensure Docker and Docker Compose are installed.
2. From the project root, run:

```powershell
docker-compose up --build
```

This will:
- Build and start the frontend (Next.js) on port 3000.
- Build and start the backend (FastAPI) on port 8000.
- Start MongoDB on port 27017 with data persisted in a Docker volume.

The frontend will be accessible at `http://localhost:3000`, and it will communicate with the backend at `http://localhost:8000`.

Environment variables are pre-configured in `docker-compose.yml`:
- Frontend: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Backend: `MONGODB_URI=mongodb://mongodb:27017`, `MONGODB_DB=surveydb`

To stop the services:

```powershell
docker-compose down
```

To run in detached mode (background):

```powershell
docker-compose up -d --build
```

## Storybook & UI Testing

The frontend uses Storybook for component development and visual testing, with integration to Chromatic.
Story files are organized under:

- `frontend/src/stories/ui` for shared UI primitives (`src/components/ui`).
- `frontend/src/stories/app` for app-level components.

### Running Storybook locally

```powershell
cd frontend
npm run storybook
```

Storybook will start on `http://localhost:6006`.

### Publishing to Chromatic

For local publishing:

```powershell
cd frontend
npm run chromatic -- --project-token=<your-project-token>
```

You can also set the token in an environment variable:

```powershell
$env:CHROMATIC_PROJECT_TOKEN='<your-project-token>'
npm run chromatic -- --project-token=$env:CHROMATIC_PROJECT_TOKEN
```

Build the static Storybook output:

```powershell
npm run build-storybook
```

CI publishing on pull requests:

- Workflow: `.github/workflows/chromatic-frontend.yml`
- Required GitHub repository secret: `CHROMATIC_PROJECT_TOKEN`

## Development notes

- Tests and linters: check `package.json` and the project root for available scripts (for example `npm test`, `npm run lint`).
- Configuration: frontend configuration files are in the repository root (Next.js, Tailwind, ESLint, TypeScript configs).
- If you plan to work on both frontend and backend at the same time, run the frontend (usually on :3000) and backend (default :8000) concurrently.

## Contributing

Small, focused pull requests are welcome. If you add features that require new env vars or new build steps, update this README accordingly.

