import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import motor.motor_asyncio
from bson import ObjectId


class QuestionItem(BaseModel):
    id: str
    questionText: str
    component: str
    option: Optional[List[str]] = None
    layout: Optional[str] = None


class Survey(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    questions: List[QuestionItem]


app = FastAPI()

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
