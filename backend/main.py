
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.exceptions import RequestValidationError

from backend.routers import surveys
from backend.middleware.error_handling import cache_body_middleware, validation_exception_handler
from backend.migrations import run_migrations
from backend.db.mongo.seed_data import seed_example_survey
from contextlib import asynccontextmanager

app = FastAPI()
# add CORS resolves
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # or ["*"] if NOT use cookies/auth
    allow_credentials=True,       # when will sending cookies/Authorization
    allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allow_headers=["Content-Type","Authorization"],
)

app.include_router(surveys.router)

# Add middleware
app.middleware("http")(cache_body_middleware)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
# add CORS resolves
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # or ["*"] if NOT use cookies/auth
    allow_credentials=True,       # when will sending cookies/Authorization
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_migrations()
    await seed_example_survey()
    yield

app = FastAPI(lifespan=lifespan)


# debug
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
