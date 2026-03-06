from .mongoDB import surveys_collection

DEMO_SURVEY_TITLE = "Demo Survey"
PUBLISHED_DEMO_SURVEY_TITLE = "Published Demo Survey"


async def seed_demo_survey(created_by_id: str, created_by_email: str) -> None:
    """
    Idempotently seed a demo survey for the provided owner.
    """
    sample = {
        "title": DEMO_SURVEY_TITLE,
        "status": "draft",
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
                "layout": {"i": "demo-q1", "x": 0, "y": 0, "w": 3, "h": 3, "minW": 3, "minH": 3},
            }
        ],
        "layouts": {
            "lg": [{"i": "demo-q1", "x": 0, "y": 0, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "md": [{"i": "demo-q1", "x": 0, "y": 0, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "sm": [{"i": "demo-q1", "x": 0, "y": 0, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "xs": [{"i": "demo-q1", "x": 0, "y": 0, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "xxs": [{"i": "demo-q1", "x": 0, "y": 0, "w": 3, "h": 3, "minW": 3, "minH": 3}],
        },
        "created_by_id": created_by_id,
        "created_by_email": created_by_email,
    }
    existing = await surveys_collection.find_one(
        {"created_by_id": created_by_id, "title": sample["title"]}
    )
    if not existing:
        await surveys_collection.insert_one(sample)

    published_sample = {
        "title": PUBLISHED_DEMO_SURVEY_TITLE,
        "status": "published",
        "questions": [
            {
                "id": "published-demo-q1",
                "questionText": "Choose your favorite option",
                "component": "RadioBar",
                "option": {
                    "optionProps": {
                        "name": "published-demo-group",
                        "buttons": [
                            {"label": "Option A", "value": "Option A"},
                            {"label": "Option B", "value": "Option B"},
                        ],
                    }
                },
                "layout": {"i": "published-demo-q1", "x": 4, "y": 1, "w": 3, "h": 3, "minW": 3, "minH": 3},
            }
        ],
        "layouts": {
            "lg": [{"i": "published-demo-q1", "x": 4, "y": 1, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "md": [{"i": "published-demo-q1", "x": 4, "y": 1, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "sm": [{"i": "published-demo-q1", "x": 0, "y": 1, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "xs": [{"i": "published-demo-q1", "x": 0, "y": 1, "w": 3, "h": 3, "minW": 3, "minH": 3}],
            "xxs": [{"i": "published-demo-q1", "x": 0, "y": 1, "w": 2, "h": 3, "minW": 2, "minH": 3}],
        },
        "created_by_id": created_by_id,
        "created_by_email": created_by_email,
    }
    published_existing = await surveys_collection.find_one(
        {"created_by_id": created_by_id, "title": published_sample["title"]}
    )
    if not published_existing:
        await surveys_collection.insert_one(published_sample)
