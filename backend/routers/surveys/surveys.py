"""
Route for managing surveys.
"""
from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from pymongo.errors import DuplicateKeyError

from backend.models.api.surveys import Survey, SurveyCreate, SurveyListResponse, SurveyOption, SurveyStatus
from backend.models.db.sql.auth import User
from backend.routers.auth.auth import get_current_user
from backend.db.mongo import surveys_collection

router = APIRouter(
    prefix="/surveys",
    tags=["surveys"]
)


def _to_survey_status(survey: dict) -> SurveyStatus:
    raw_status = survey.get("status")
    if raw_status in {SurveyStatus.draft.value, SurveyStatus.published.value}:
        return SurveyStatus(raw_status)
    return SurveyStatus.published if bool(survey.get("is_public")) else SurveyStatus.draft


def _normalize_survey(survey: dict) -> dict:
    normalized = dict(survey)
    normalized["id"] = str(normalized["_id"])
    normalized.pop("_id", None)
    normalized["status"] = _to_survey_status(survey).value
    return normalized


def _parse_survey_object_id(id: str) -> ObjectId:
    try:
        return ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid survey ID format")


@router.post("/")
async def create_survey(survey: SurveyCreate, current_user: User = Depends(get_current_user)):
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
        survey_dict["status"] = survey.status.value
        survey_dict["created_by_id"] = str(current_user.id)
        survey_dict["created_by_email"] = current_user.email

        result = await surveys_collection.insert_one(survey_dict)
        return {"id": str(result.inserted_id)}
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Survey title already exists for this user",
        )
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
            "title": survey.get("title", f"Untitled Survey {survey['_id']}"),
            "status": _to_survey_status(survey).value,
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
        surveys.append(_normalize_survey(survey))

    return {"surveys": surveys}


@router.get("/public/{id}", response_model=Survey)
async def get_public_survey(id: str):
    """
    Return a published survey for anonymous responders.
    """
    object_id = _parse_survey_object_id(id)
    survey = await surveys_collection.find_one({"_id": object_id})
    if not survey or _to_survey_status(survey) != SurveyStatus.published:
        raise HTTPException(status_code=404, detail="Survey not found")
    return Survey(**_normalize_survey(survey))


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
    object_id = _parse_survey_object_id(id)
    survey = await surveys_collection.find_one({
        "_id": object_id,
        # Only get surveys owned by current user
        "created_by_id": str(current_user.id)
    })

    if not survey:
        raise HTTPException(
            status_code=404, detail="Survey not found or access denied")

    return Survey(**_normalize_survey(survey))


@router.put("/{id}")
async def update_survey(id: str, survey: SurveyCreate, current_user: User = Depends(get_current_user)):
    """
    Update an existing survey by ID for the authenticated owner.

    :param id: The ID of the survey to update.
    :type id: str
    :param survey: Updated survey payload.
    :type survey: SurveyCreate
    :param current_user: The authenticated user updating the survey.
    :type current_user: User
    :raises HTTPException: If ID is invalid, survey is missing, access is denied, or title conflicts.
    :return: The ID of the updated survey.
    :rtype: dict
    """
    object_id = _parse_survey_object_id(id)

    try:
        survey_dict = survey.model_dump(exclude_none=True)
        survey_dict["status"] = survey.status.value
        survey_dict["created_by_email"] = current_user.email

        result = await surveys_collection.update_one(
            {
                "_id": object_id,
                "created_by_id": str(current_user.id),
            },
            {"$set": survey_dict},
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Survey title already exists for this user",
        )
    except RequestValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404, detail="Survey not found or access denied")

    return {"id": id}


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
            "_id": _parse_survey_object_id(id),
            # Only delete if owned by current user
            "created_by_id": str(current_user.id)
        })
    except HTTPException:
        raise

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404, detail="Survey not found or access denied")

    return {"message": "Survey deleted successfully"}
