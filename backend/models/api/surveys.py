"""
Models for survey questions and options.
"""
from typing import List, Optional, Union
from pydantic import BaseModel, field_validator


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


# Option wrapper to match frontend Option<T> interface
class Option(BaseModel):
    optionProps: Union[ToggleSwitchProps, TextFieldProps, RadioBarProps]


class QuestionItem(BaseModel):
    id: str
    questionText: str
    component: str
    option: Optional[Option] = None


class Survey(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    is_public: Optional[bool] = False
    created_by_id: str = None
    questions: List[QuestionItem]


class SurveyCreate(BaseModel):
    title: str
    is_public: Optional[bool] = False
    questions: List[QuestionItem]

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
