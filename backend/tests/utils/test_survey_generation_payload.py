from backend.models.api.surveys.survey_generation import (
    SurveyGenerationPayload,
    build_survey_generation_payload,
)


def test_build_survey_generation_payload_returns_pydantic_model() -> None:
    payload = build_survey_generation_payload(
        model="gpt-4.1-mini",
        prompt="Create a product feedback survey",
        system_prompt="System instructions",
    )

    assert isinstance(payload, SurveyGenerationPayload)

    dumped = payload.model_dump(mode="json", by_alias=True)
    assert dumped["model"] == "gpt-4.1-mini"
    assert dumped["input"][0]["role"] == "system"
    assert dumped["input"][0]["content"][0]["type"] == "input_text"
    assert dumped["input"][1]["role"] == "user"
    assert "USER_DESCRIPTION:" in dumped["input"][1]["content"][0]["text"]
    assert dumped["text"]["format"]["type"] == "json_schema"
    assert dumped["text"]["format"]["strict"] is True
    assert "schema" in dumped["text"]["format"]
