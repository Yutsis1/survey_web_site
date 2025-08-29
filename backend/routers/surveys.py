
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.exceptions import RequestValidationError

from ..models.surveys import *
from ..db.mongoDB import surveys_collection

router = APIRouter(
    prefix="/surveys",
    tags=["surveys"]
)


@router.post("/")
async def create_survey(survey: Survey):
    """_summary_

    :param survey: _description_
    :type survey: Survey
    :return: _description_
    :rtype: _type_
    """
    try:
        survey_dict = survey.model_dump(exclude_none=True)
        result = await surveys_collection.insert_one(survey_dict)
        return {"id": str(result.inserted_id)}
    except RequestValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/{id}", response_model=Survey)
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
