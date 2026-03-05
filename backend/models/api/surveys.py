"""
Models for survey questions and options.
"""
from enum import Enum
from typing import List, Optional, Union
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class RadioProps(BaseModel):
    label: str
    value: str


class ToggleSwitchProps(BaseModel):
    activeLabel: Optional[str] = None
    inactiveLabel: Optional[str] = None
    checked: Optional[bool] = None


class TextFieldProps(BaseModel):
    label: Optional[str] = None
    placeholder: Optional[str] = None
    value: Optional[str] = None
    test_id: Optional[str] = None
    type: Optional[str] = None
    className: Optional[str] = None


class RadioBarProps(BaseModel):
    buttons: List[RadioProps]
    name: Optional[str] = None
    selectedValue: Optional[str] = None
    test_id: Optional[str] = None


class CheckboxTileProps(BaseModel):
    label: str
    value: str


class CheckboxTilesProps(BaseModel):
    buttons: List[CheckboxTileProps]
    name: Optional[str] = None
    selectedValues: Optional[List[str]] = None
    test_id: Optional[str] = None


class DropDownOption(BaseModel):
    label: str
    value: str


class DropDownProps(BaseModel):
    options: List[DropDownOption]
    selectedOption: str
    label: Optional[str] = None
    id: Optional[str] = None
    name: Optional[str] = None
    disabled: Optional[bool] = None
    test_id: Optional[str] = None


# Option wrapper to match frontend Option<T> interface
class Option(BaseModel):
    optionProps: Union[
        ToggleSwitchProps,
        TextFieldProps,
        RadioBarProps,
        CheckboxTilesProps,
        DropDownProps,
    ]


class QuestionItem(BaseModel):
    id: str
    questionText: str
    component: str
    option: Optional[Option] = None
    layout: Optional["LayoutItem"] = None


class SurveyStatus(str, Enum):
    draft = "draft"
    published = "published"


class LayoutItem(BaseModel):
    i: str
    x: int
    y: int
    w: int
    h: int
    minW: Optional[int] = None
    minH: Optional[int] = None


class SurveyLayouts(BaseModel):
    lg: List[LayoutItem] = Field(default_factory=list)
    md: List[LayoutItem] = Field(default_factory=list)
    sm: List[LayoutItem] = Field(default_factory=list)
    xs: List[LayoutItem] = Field(default_factory=list)
    xxs: List[LayoutItem] = Field(default_factory=list)


class Survey(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    status: SurveyStatus = SurveyStatus.draft
    questions: List[QuestionItem]
    layouts: Optional[SurveyLayouts] = None


class SurveyCreate(BaseModel):
    title: str
    status: SurveyStatus = SurveyStatus.draft
    questions: List[QuestionItem]
    layouts: Optional[SurveyLayouts] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Survey title must not be empty")
        return title


class SurveyListResponse(BaseModel):
    surveys: List[Survey]


class SurveyOption(BaseModel):
    id: str
    title: str
    status: SurveyStatus = SurveyStatus.draft


class SurveyAnswer(BaseModel):
    questionId: str
    value: Union[str, bool, List[str]]


class SurveyResponseCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    surveyId: Optional[str] = None
    answers: List[SurveyAnswer]
    submitted_at: Optional[datetime] = Field(default=None, alias="submittedAt")


class SurveyResponseRead(BaseModel):
    id: str
    surveyId: str
    answers: List[SurveyAnswer]
    submittedAt: datetime


class PaginatedResponseList(BaseModel):
    responses: List[SurveyResponseRead]
    page: int
    page_size: int
    total_count: int


class TrendPoint(BaseModel):
    date: str
    responses: int


class QuestionStats(BaseModel):
    questionId: str
    questionText: str
    counts: List[dict]  # List of {"option": str, "count": int}


class SurveyResponseStats(BaseModel):
    surveyId: str
    title: str
    status: SurveyStatus
    createdDate: str
    responsesCount: int
    completionRate: float
    trend: List[TrendPoint]
    questionBreakdown: List[QuestionStats]
