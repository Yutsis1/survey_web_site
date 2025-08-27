import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import motor.motor_asyncio
from bson import ObjectId
import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class QuestionItem(BaseModel):
    id: str
    questionText: str
    component: str
    option: Optional[List[str]] = None


class Survey(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    questions: List[QuestionItem]


app = FastAPI()


@app.middleware("http")
async def cache_body(request: Request, call_next):
    body = await request.body()
    # put it back so downstream can read it again

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}
    request._receive = receive
    request.state.raw_body = body
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    resp = JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "received_body": (request.state.raw_body or b"").decode("utf-8", errors="replace"),
            "content_type": request.headers.get("content-type"),
        },
    )
    return resp
# add CORS resolves
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # or ["*"] if NOT use cookies/auth
    allow_credentials=True,       # when will sending cookies/Authorization
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "survey")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]
surveys_collection = db["surveys"]


@app.post("/surveys")
async def create_survey(survey: Survey):
    """_summary_

    :param survey: _description_
    :type survey: Survey
    :return: _description_
    :rtype: _type_
    """
    survey_dict = survey.model_dump(exclude_none=True)
    result = await surveys_collection.insert_one(survey_dict)
    return {"id": str(result.inserted_id)}


@app.get("/surveys/{id}", response_model=Survey)
async def get_survey(id: str):
    """
    Get a survey by its ID.

    :param id: The ID of the survey to retrieve.
    :type id: str
    :raises HTTPException: If the survey is not found.
    :return: The requested survey.
    :rtype: Survey
    """
    survey = await surveys_collection.find_one({"_id": ObjectId(id)})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey["id"] = str(survey["_id"])
    survey.pop("_id", None)
    return Survey(**survey)


# debug
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
