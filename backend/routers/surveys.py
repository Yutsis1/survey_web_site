"""
Route for managing surveys.
"""
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.exceptions import RequestValidationError

from ..models.api.surveys import *
from ..db.mongo.mongoDB import surveys_collection
from ..routers.auth.auth import get_current_user
from ..models.db.sql.auth import User

router = APIRouter(
    prefix="/surveys",
    tags=["surveys"]
)


@router.post("/")
async def create_survey(survey: Survey, current_user: User = Depends(get_current_user)):
    """Create a new survey.

    :param survey: The survey to create.
    :type survey: Survey
    :param current_user: The authenticated user creating the survey.
    :type current_user: User
    :return: The ID of the created survey.
    :rtype: dict
    """
    try:
        survey_dict = survey.model_dump(exclude_none=True)
        # Add user information to the survey
        survey_dict["created_by_id"] = str(current_user.id)
        survey_dict["created_by_email"] = current_user.email
        survey_dict["is_public"] = survey.is_public if survey.is_public is not None else False
        
        result = await surveys_collection.insert_one(survey_dict)
        return {"id": str(result.inserted_id)}
    except RequestValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/options", response_model=List[SurveyOption])
async def get_survey_options(current_user: User = Depends(get_current_user)):
    """
    Get a list of survey options (ID and title) for the authenticated user.

    :param current_user: The authenticated user.
    :type current_user: User
    :return: List of survey options.
    :rtype: list[SurveyOption]
    """
    cursor = surveys_collection.find({"created_by_id": str(current_user.id)})
    options = []

    async for survey in cursor:
        options.append({
            "id": str(survey["_id"]),
            "title": survey.get("title", f"Untitled Survey {survey['_id']}")
        })

    return options


@router.get("/", response_model=SurveyListResponse)
async def list_surveys(current_user: User = Depends(get_current_user)):
    """
    List all surveys for the authenticated user.

    :param current_user: The authenticated user.
    :type current_user: User
    :return: List of surveys created by the user.
    :rtype: list[Survey]
    """
    # Get surveys created by the current user
    cursor = surveys_collection.find({"created_by_id": str(current_user.id)})
    surveys = []
    
    async for survey in cursor:
        survey["id"] = str(survey["_id"])
        survey.pop("_id", None)
        surveys.append(survey)
    
    return {"surveys": surveys}


@router.get("/{id}", response_model=Survey)
async def get_survey(id: str, current_user: User = Depends(get_current_user)):
    """
    Get a survey by its ID.

    :param id: The ID of the survey to retrieve.
    :type id: str
    :param current_user: The authenticated user requesting the survey.
    :type current_user: User
    :raises HTTPException: If the survey is not found or access is denied.
    :return: The requested survey.
    :rtype: Survey
    """
    try:
        survey = await surveys_collection.find_one({
            "_id": ObjectId(id),
            "created_by_id": str(current_user.id)  # Only get surveys owned by current user
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid survey ID format")
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or access denied")

    survey["id"] = str(survey["_id"])
    survey.pop("_id", None)
    return Survey(**survey)

@router.delete("/{id}")
async def delete_survey(id: str, current_user: User = Depends(get_current_user)):
    """
    Delete a survey by its ID.

    :param id: The ID of the survey to delete.
    :type id: str
    :param current_user: The authenticated user requesting the deletion.
    :type current_user: User
    :raises HTTPException: If the survey is not found or access is denied.
    :return: Success message.
    :rtype: dict
    """
    try:
        result = await surveys_collection.delete_one({
            "_id": ObjectId(id),
            "created_by_id": str(current_user.id)  # Only delete if owned by current user
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid survey ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Survey not found or access denied")
    
    return {"message": "Survey deleted successfully"}
