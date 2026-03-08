"""Pydantic models and schema for generated survey drafts."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_GENERATED_QUESTIONS = 5
MAX_GENERATED_OPTIONS = 10


class GeneratedSurveyQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    questionText: str = Field(min_length=1, max_length=200)
    component: Literal["TextInput", "RadioBar", "CheckboxTiles", "DropDown", "Switch"]
    options: list[str] | None = Field(default=None, max_length=MAX_GENERATED_OPTIONS)
    placeholder: str | None = Field(default=None, max_length=120)
    activeLabel: str | None = Field(default=None, max_length=40)
    inactiveLabel: str | None = Field(default=None, max_length=40)

    @field_validator("options")
    @classmethod
    def validate_options(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return value

        cleaned = [option.strip() for option in value if isinstance(option, str)]
        if not all(cleaned):
            raise ValueError("Options must not be empty")
        if any(len(option) > 80 for option in cleaned):
            raise ValueError("Each option must be 80 characters or fewer")
        return cleaned


class GeneratedSurveyDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=120)
    questions: list[GeneratedSurveyQuestion] = Field(min_length=1, max_length=MAX_GENERATED_QUESTIONS)


def survey_generation_schema() -> dict[str, Any]:
    """Return JSON Schema used by the OpenAI response format contract."""
    return GeneratedSurveyDraft.model_json_schema()
