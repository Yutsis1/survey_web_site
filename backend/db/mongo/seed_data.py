from .mongoDB import surveys_collection

async def seed_example_survey() -> None:
    sample = {
        "title": "Example Survey",
        "questions": [
            {"id": "1", "questionText": "Example question?", "component": "text"}
        ],
    }
    existing = await surveys_collection.find_one({"title": sample["title"]})
    if not existing:
        await surveys_collection.insert_one(sample)
