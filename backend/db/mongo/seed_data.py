from .mongoDB import surveys_collection

DEMO_SURVEY_TITLE = "Demo Survey"


async def seed_demo_survey(created_by_id: str, created_by_email: str) -> None:
    """
    Idempotently seed a demo survey for the provided owner.
    """
    sample = {
        "title": DEMO_SURVEY_TITLE,
        "questions": [
            {
                "id": "demo-q1",
                "questionText": "How satisfied are you with this demo survey?",
                "component": "TextInput",
                "option": {
                    "optionProps": {
                        "label": "Your feedback",
                        "placeholder": "Type your answer here",
                    }
                },
            }
        ],
        "created_by_id": created_by_id,
        "created_by_email": created_by_email,
        "is_public": False,
    }
    existing = await surveys_collection.find_one(
        {"created_by_id": created_by_id, "title": sample["title"]}
    )
    if not existing:
        await surveys_collection.insert_one(sample)
