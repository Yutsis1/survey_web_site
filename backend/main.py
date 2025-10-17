from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from backend.config import settings
from backend.routers.auth import auth
from backend.routers import surveys
from backend.middleware.error_handling import cache_body_middleware, validation_exception_handler
from backend.db.mongo.migrations import run_migrations
from backend.db.mongo.seed_data import seed_example_survey
from backend.db.sql.init_db import init_database
import logging
from starlette.middleware.base import BaseHTTPMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize PostgreSQL database
    await init_database()
    # Run MongoDB migrations
    await run_migrations()
    await seed_example_survey()
    yield

app = FastAPI(lifespan=lifespan)

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

app.add_middleware(
    LogDisallowedOriginsMiddleware,  # check disallowed origins
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(surveys.router)
app.include_router(auth.router)

# Add middleware
app.middleware("http")(cache_body_middleware)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# debug
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
