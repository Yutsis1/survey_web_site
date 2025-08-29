import pytest
from fastapi.testclient import TestClient
from types import SimpleNamespace
from bson import ObjectId
from backend.main import app
from backend.db.mongoDB import surveys_collection

# python

# Relative import of the app and surveys_collection to test (package-aware)

client = TestClient(app)


@pytest.mark.asyncio
async def test_create_survey_success(monkeypatch):
    # Prepare input payload
    payload = {
        "title": "Customer Feedback",
        "questions": [
            {
                "id": "q1",
                "questionText": "How did you hear about us?",
                "component": "text",
            }
        ],
    }

    fake_id = ObjectId()

    # async fake insert_one returning an object with inserted_id
    async def fake_insert_one(doc):
        return SimpleNamespace(inserted_id=fake_id)

    # Patch the collection's insert_one
    monkeypatch.setattr(surveys_collection, "insert_one", fake_insert_one)

    resp = client.post("/surveys", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "id" in data
    assert data["id"] == str(fake_id)


@pytest.mark.asyncio
async def test_get_survey_success(monkeypatch):
    # Create a fake survey document as stored in MongoDB
    object_id = ObjectId()
    fake_doc = {
        "_id": object_id,
        "title": "Employee Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Are you satisfied?",
                "component": "radio",
                "option": {
                    "optionProps": {
                        "buttons": [
                            {"label": "yes", "value": "yes"},
                            {"label": "no", "value": "no"}
                        ]
                    }
                },
                "layout": None,
            }
        ],
    }

    async def fake_find_one(query):
        # simple check to mimic expected query shape
        if query.get("_id") == object_id:
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    resp = client.get(f"/surveys/{str(object_id)}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(object_id)
    assert data["title"] == fake_doc["title"]
    assert len(data["questions"]) == 1
    assert data["questions"][0]["id"] == "q1"
    assert data["questions"][0]["questionText"] == "Are you satisfied?"
    assert data["questions"][0]["component"] == "radio"
    assert data["questions"][0]["option"]["optionProps"]["buttons"] == [
        {"label": "yes", "value": "yes"},
        {"label": "no", "value": "no"}
    ]


@pytest.mark.asyncio
async def test_get_survey_not_found(monkeypatch):
    async def fake_find_none(query):
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_none)

    some_id = str(ObjectId())
    resp = client.get(f"/surveys/{some_id}")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Survey not found"


def test_create_survey_validation_error():
    # Missing required 'questions' field should yield a validation error (422)
    payload = {"title": "Bad payload"}
    resp = client.post("/surveys", json=payload)
    assert resp.status_code == 422