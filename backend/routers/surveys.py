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
        survey_dict["created_by"] = str(current_user.id)
        survey_dict["created_by_email"] = current_user.email
        
        result = await surveys_collection.insert_one(survey_dict)
        return {"id": str(result.inserted_id)}
    except RequestValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/{id}", response_model=Survey)
async def get_survey(id: str, current_user: User = Depends(get_current_user)):
    """
    Get a survey by its ID.

    :param id: The ID of the survey to retrieve.
    :type id: str
    :param current_user: The authenticated user requesting the survey.
    :type current_user: User
    :raises HTTPException: If the survey is not found.
    :return: The requested survey.
    :rtype: Survey
    """
    survey = await surveys_collection.find_one({"_id": ObjectId(id)})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Optional: Add access control - users can only see their own surveys
    # not implemented yet
    # if survey.get("created_by") != str(current_user.id):
    #     raise HTTPException(status_code=403, detail="Access denied")
    
    survey["id"] = str(survey["_id"])
    survey.pop("_id", None)
    return Survey(**survey)


@router.get("/")
async def list_surveys(current_user: User = Depends(get_current_user)):
    """
    List all surveys for the authenticated user.

    :param current_user: The authenticated user.
    :type current_user: User
    :return: List of surveys created by the user.
    :rtype: list
    """
    # Get surveys created by the current user
    cursor = surveys_collection.find({"created_by": str(current_user.id)})
    surveys = []
    
    async for survey in cursor:
        survey["id"] = str(survey["_id"])
        survey.pop("_id", None)
        surveys.append(survey)
    
    return {"surveys": surveys}

# Not implemented yet
# @router.delete("/{id}")
# async def delete_survey(id: str, current_user: User = Depends(get_current_user)):
#     """
#     Delete a survey by its ID.

#     :param id: The ID of the survey to delete.
#     :type id: str
#     :param current_user: The authenticated user requesting the deletion.
#     :type current_user: User
#     :raises HTTPException: If the survey is not found or access is denied.
#     :return: Success message.
#     :rtype: dict
#     """
#     # First check if survey exists and belongs to the user
#     survey = await surveys_collection.find_one({"_id": ObjectId(id)})
#     if not survey:
#         raise HTTPException(status_code=404, detail="Survey not found")
    
#     # Check if user owns the survey
#     if survey.get("created_by") != str(current_user.id):
#         raise HTTPException(status_code=403, detail="Access denied")
    
#     # Delete the survey
#     result = await surveys_collection.delete_one({"_id": ObjectId(id)})
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Survey not found")
    
#     return {"message": "Survey deleted successfully"}
