from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from fastapi.responses import RedirectResponse

from backend.config import settings
from backend.routers.auth import auth
from backend.routers import surveys
from backend.middleware.error_handling import cache_body_middleware, validation_exception_handler
from backend.db.mongo.migrations import run_migrations
from backend.db.mongo.seed_data import seed_demo_survey
from backend.db.sql.init_db import init_database
from backend.db.sql.migrations import run_migrations as run_sql_migrations
from backend.db.sql.seed_data import seed_demo_user
import logging
from starlette.middleware.base import BaseHTTPMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize PostgreSQL database
    await init_database()
    # Run SQL migrations (handle demo user password sync)
    await run_sql_migrations()
    demo_user = await seed_demo_user()
    # Run MongoDB migrations
    await run_migrations()
    if demo_user:
        await seed_demo_survey(
            created_by_id=str(demo_user.id),
            created_by_email=demo_user.email,
        )
    yield


tags_metadata = [
    {
        "name": "auth",
        "description": "Authentication endpoints for managing user registration and login.",
    },
    {
        "name": "surveys",
        "description": "Operations for creating and managing surveys.",
    },
]

app = FastAPI(
    title="Survey API",
    description="API for managing surveys and authentication.",
    version="1.0.0",
    docs_url="/swagger",
    openapi_url="/swagger.json",
    redoc_url=None,
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

# CORS configuration
origins = settings.ALLOWED_ORIGINS
logger = logging.getLogger(__name__)

class LogDisallowedOriginsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        origin = request.headers.get("origin")
        if origin and origin not in origins:
            logger.warning(f"Request from disallowed origin: {origin}")
        response = await call_next(request)
        return response
# for logging disallowed origins
app.add_middleware(LogDisallowedOriginsMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(surveys.router)
app.include_router(auth.router)


@app.get("/", include_in_schema=False)
async def redirect_to_docs():
    return RedirectResponse("/swagger")

# Add middleware
app.middleware("http")(cache_body_middleware)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# debug
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
