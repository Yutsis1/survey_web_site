"""
Middleware for caching request body and handling validation errors.
For debugging purposes, it caches the raw request body.
"""

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def cache_body_middleware(request: Request, call_next):
    """
    Middleware to cache the request body so it can be accessed multiple times.
    This is useful for debugging and error handling.
    """
    body = await request.body()
    # put it back so downstream can read it again

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}
    
    request._receive = receive
    request.state.raw_body = body
    return await call_next(request)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom exception handler for request validation errors.
    Returns detailed error information including the raw request body.
    """
    resp = JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "received_body": (request.state.raw_body or b"").decode("utf-8", errors="replace"),
            "content_type": request.headers.get("content-type"),
        },
    )
    return resp
