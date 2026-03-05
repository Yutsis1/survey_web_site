"""
Routes for managing survey responses.
"""
from datetime import datetime, timezone
from typing import Optional
import uuid
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import desc, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from collections import defaultdict

from ..models.api.surveys import (
    SurveyResponseCreate,
    SurveyResponseRead,
    PaginatedResponseList,
    SurveyResponseStats,
    TrendPoint,
    QuestionStats,
    SurveyStatus,
)
from ..db.mongo.mongoDB import surveys_collection
from ..routers.auth.auth import get_current_user
from ..db.sql.sql_driver import get_async_db
from ..models.db.sql.auth import User, SurveyResponse

router = APIRouter(
    prefix="/surveys",
    tags=["responses"]
)


def _parse_survey_object_id(id: str) -> ObjectId:
    try:
        return ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid survey ID format")


def _to_survey_status(survey: dict) -> SurveyStatus:
    raw_status = survey.get("status")
    if raw_status in {SurveyStatus.draft.value, SurveyStatus.published.value}:
        return SurveyStatus(raw_status)
    return SurveyStatus.published if bool(survey.get("is_public")) else SurveyStatus.draft


def _serialize_response(response: SurveyResponse) -> dict:
    return {
        "id": str(response.id),
        "surveyId": response.survey_id,
        "answers": response.answers,
        "submittedAt": response.submitted_at,
    }


@router.post("/{id}/responses")
async def submit_response(
    id: str,
    payload: SurveyResponseCreate,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Submit an anonymous response for a published survey.
    """
    object_id = _parse_survey_object_id(id)
    survey = await surveys_collection.find_one({"_id": object_id})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    if _to_survey_status(survey) != SurveyStatus.published:
        raise HTTPException(status_code=403, detail="Survey is not published")

    try:
        survey_owner_id = uuid.UUID(str(survey["created_by_id"]))
    except Exception:
        raise HTTPException(status_code=500, detail="Survey owner is invalid")

    submitted_at = payload.submitted_at or datetime.now(timezone.utc)
    if submitted_at.tzinfo is None:
        submitted_at = submitted_at.replace(tzinfo=timezone.utc)

    response = SurveyResponse(
        survey_id=id,
        survey_owner_id=survey_owner_id,
        answers=[answer.model_dump() for answer in payload.answers],
        submitted_at=submitted_at,
    )
    db.add(response)
    await db.commit()
    await db.refresh(response)
    return {"id": str(response.id)}


@router.get("/{id}/responses", response_model=PaginatedResponseList)
async def list_responses(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of responses per page"),
):
    """
    List responses for a survey owned by the current user with pagination.
    """
    object_id = _parse_survey_object_id(id)
    survey = await surveys_collection.find_one({
        "_id": object_id,
        "created_by_id": str(current_user.id)
    })
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or access denied")

    # Count total responses
    count_query = select(func.count()).select_from(SurveyResponse).where(
        SurveyResponse.survey_id == id,
        SurveyResponse.survey_owner_id == current_user.id,
    )
    total_count = (await db.execute(count_query)).scalar() or 0

    # Fetch paginated responses
    offset = (page - 1) * page_size
    query = (
        select(SurveyResponse)
        .where(
            SurveyResponse.survey_id == id,
            SurveyResponse.survey_owner_id == current_user.id,
        )
        .order_by(desc(SurveyResponse.submitted_at), desc(SurveyResponse.id))
        .limit(page_size)
        .offset(offset)
    )
    result = await db.execute(query)
    responses = result.scalars().all()

    return {
        "responses": [_serialize_response(r) for r in responses],
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
    }


@router.get("/{id}/responses/stats", response_model=SurveyResponseStats)
async def get_survey_stats(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    start_date: Optional[str] = Query(None, description="Start date filter (ISO format YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (ISO format YYYY-MM-DD)"),
):
    """
    Get aggregated statistics for a survey owned by the current user.
    Includes response count, completion rate, trend data, and question breakdown.
    """
    object_id = _parse_survey_object_id(id)
    survey = await surveys_collection.find_one({
        "_id": object_id,
        "created_by_id": str(current_user.id)
    })
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or access denied")

    # Parse date filters if provided
    start_dt = None
    end_dt = None
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
    if end_date:
        try:
            # Set to end of day
            end_dt = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")

    # Build query for responses
    query = select(SurveyResponse).where(
        SurveyResponse.survey_id == id,
        SurveyResponse.survey_owner_id == current_user.id,
    )
    
    if start_dt:
        query = query.where(SurveyResponse.submitted_at >= start_dt)
    if end_dt:
        query = query.where(SurveyResponse.submitted_at <= end_dt)

    result = await db.execute(query)
    responses = result.scalars().all()

    # Calculate stats
    total_responses = len(responses)
    questions = survey.get("questions", [])
    total_questions = len(questions)
    
    # Calculate completion rate
    completion_rate = 0.0
    if total_responses > 0 and total_questions > 0:
        completion_rates = []
        for response in responses:
            answered = len(response.answers)
            rate = (answered / total_questions) * 100 if total_questions > 0 else 0
            completion_rates.append(rate)
        completion_rate = round(sum(completion_rates) / len(completion_rates), 1)

    # Build trend data (group by date)
    trend_data = defaultdict(int)
    for response in responses:
        date_str = response.submitted_at.date().isoformat()
        trend_data[date_str] += 1
    
    trend = [
        TrendPoint(date=date, responses=count)
        for date, count in sorted(trend_data.items())
    ]

    # Build question breakdown
    question_breakdown = []
    for question in questions:
        question_id = question.get("id")
        question_text = question.get("questionText", f"Question {question_id}")
        
        # Count answers for this question
        option_counts = defaultdict(int)
        for response in responses:
            # Find answer for this question
            for answer in response.answers:
                if answer.get("questionId") == question_id:
                    value = answer.get("value")
                    # Convert value to string for grouping
                    if isinstance(value, list):
                        key = ", ".join(str(v) for v in value)
                    elif isinstance(value, bool):
                        key = "Yes" if value else "No"
                    else:
                        key = str(value)
                    option_counts[key] += 1
                    break
        
        counts = [
            {"option": option, "count": count}
            for option, count in sorted(option_counts.items())
        ]
        
        question_breakdown.append(QuestionStats(
            questionId=question_id,
            questionText=question_text,
            counts=counts
        ))

    # Get survey creation date
    created_date = survey.get("created_at")
    if created_date:
        if isinstance(created_date, datetime):
            created_date_str = created_date.date().isoformat()
        else:
            created_date_str = str(created_date)[:10]  # Take first 10 chars (YYYY-MM-DD)
    else:
        created_date_str = datetime.now().date().isoformat()

    return SurveyResponseStats(
        surveyId=id,
        title=survey.get("title", "Untitled Survey"),
        status=_to_survey_status(survey),
        createdDate=created_date_str,
        responsesCount=total_responses,
        completionRate=completion_rate,
        trend=trend,
        questionBreakdown=question_breakdown,
    )


@router.get("/{id}/responses/latest", response_model=SurveyResponseRead)
async def get_latest_response(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Return latest response for a survey owned by the current user.
    """
    _parse_survey_object_id(id)
    query = (
        select(SurveyResponse)
        .where(
            SurveyResponse.survey_id == id,
            SurveyResponse.survey_owner_id == current_user.id,
        )
        .order_by(desc(SurveyResponse.submitted_at), desc(SurveyResponse.id))
        .limit(1)
    )
    latest = (await db.execute(query)).scalars().first()
    if not latest:
        raise HTTPException(status_code=404, detail="Response not found")
    return _serialize_response(latest)


@router.get("/{id}/responses/{response_id}", response_model=SurveyResponseRead)
async def get_response_by_id(
    id: str,
    response_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Return a specific response for a survey owned by the current user.
    """
    _parse_survey_object_id(id)
    try:
        response_uuid = uuid.UUID(response_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid response ID format")

    query = select(SurveyResponse).where(
        SurveyResponse.id == response_uuid,
        SurveyResponse.survey_id == id,
        SurveyResponse.survey_owner_id == current_user.id,
    )
    response = (await db.execute(query)).scalars().first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return _serialize_response(response)
