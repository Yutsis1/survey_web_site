"""Pydantic models and schema for generated survey drafts."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_GENERATED_QUESTIONS = 5
MAX_GENERATED_OPTIONS = 10


class GeneratedSurveyQuestion(BaseModel):
    model_config = ConfigDict(
        extra="forbid", json_schema_serialization_defaults_required=True)

    questionText: str = Field(min_length=1, max_length=200)
    component: Literal["TextInput", "RadioBar",
                       "CheckboxTiles", "DropDown", "Switch"]
    options: list[str] | None = Field(max_length=MAX_GENERATED_OPTIONS)
    placeholder: str | None = Field(max_length=120)
    activeLabel: str | None = Field(max_length=40)
    inactiveLabel: str | None = Field(max_length=40)

    @field_validator("options")
    @classmethod
    def validate_options(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return value

        cleaned = [option.strip()
                   for option in value if isinstance(option, str)]
        if not all(cleaned):
            raise ValueError("Options must not be empty")
        if any(len(option) > 80 for option in cleaned):
            raise ValueError("Each option must be 80 characters or fewer")
        return cleaned


class GeneratedSurveyDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=120)
    questions: list[GeneratedSurveyQuestion] = Field(
        min_length=1, max_length=MAX_GENERATED_QUESTIONS)


class SurveyGenerationPayloadContent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["input_text"]
    text: str


class SurveyGenerationPayloadMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["system", "user"]
    content: list[SurveyGenerationPayloadContent] = Field(min_length=1)


class SurveyGenerationPayloadSchemaFormat(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["json_schema"]
    name: str
    strict: bool
    json_schema: dict[str, Any] = Field(alias="schema")


class SurveyGenerationPayloadText(BaseModel):
    model_config = ConfigDict(extra="forbid")

    format: SurveyGenerationPayloadSchemaFormat


class SurveyGenerationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model: str
    input: list[SurveyGenerationPayloadMessage] = Field(min_length=1)
    text: SurveyGenerationPayloadText


def survey_generation_schema() -> dict[str, Any]:
    """Return JSON Schema used by the OpenAI response format contract."""
    return GeneratedSurveyDraft.model_json_schema()


def build_survey_generation_payload(
    *,
    model: str,
    prompt: str,
    system_prompt: str,
) -> SurveyGenerationPayload:
    """Build the OpenAI responses payload for survey draft generation."""
    return SurveyGenerationPayload(
        model=model,
        input=[
            SurveyGenerationPayloadMessage(
                role="system",
                content=[SurveyGenerationPayloadContent(
                    type="input_text", text=system_prompt)],
            ),
            SurveyGenerationPayloadMessage(
                role="user",
                content=[
                    SurveyGenerationPayloadContent(
                        type="input_text",
                        text=f"USER_DESCRIPTION:\n<<<\n{prompt}\n>>>",
                    )
                ],
            ),
        ],
        text=SurveyGenerationPayloadText(
            format=SurveyGenerationPayloadSchemaFormat(
                type="json_schema",
                name="survey_generation",
                strict=True,
                schema=survey_generation_schema(),
            )
        ),
    )
