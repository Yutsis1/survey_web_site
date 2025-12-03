from backend.routers.auth.auth import get_current_user
from backend.routers.surveys import router
import uuid
import pytest
from fastapi.testclient import TestClient
from types import SimpleNamespace
from bson import ObjectId
from fastapi import FastAPI
from backend.db.mongo.mongoDB import surveys_collection

app = FastAPI()
app.include_router(router)

client = TestClient(app)

# Mock the current user for authentication
fake_user = SimpleNamespace(
    id=uuid.uuid4(),
    email="test@example.com",
    role="user",
    token_version=1,
    is_active=True
)


async def fake_get_current_user():
    return fake_user


# Override the FastAPI dependency
app.dependency_overrides[get_current_user] = fake_get_current_user


@pytest.mark.asyncio
async def test_get_survey_success(monkeypatch):
    """Test successfully retrieving a survey owned by the current user."""
    object_id = ObjectId()
    fake_doc = {
        "_id": object_id,
        "title": "Employee Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Are you satisfied?",
                "component": "radio",
            }
        ],
        "created_by_id": str(fake_user.id),
        "created_by_email": fake_user.email,
        "is_public": False,
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id and query.get("created_by_id") == str(fake_user.id):
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


@pytest.mark.asyncio
async def test_get_survey_not_found(monkeypatch):
    """Test retrieving a non-existent survey."""
    async def fake_find_none(query):
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_none)

    some_id = str(ObjectId())
    resp = client.get(f"/surveys/{some_id}")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Survey not found or access denied"


@pytest.mark.asyncio
async def test_get_survey_unauthorized_access(monkeypatch):
    """Test retrieving a survey owned by another user."""
    object_id = ObjectId()
    
    async def fake_find_one(query):
        # Survey exists but created_by_id doesn't match
        if query.get("_id") == object_id and query.get("created_by_id") == str(fake_user.id):
            return None
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    resp = client.get(f"/surveys/{str(object_id)}")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Survey not found or access denied"


@pytest.mark.asyncio
async def test_get_survey_invalid_id_format(monkeypatch):
    """Test retrieving a survey with an invalid ObjectId format."""
    async def fake_find_one_raises(query):
        raise Exception("Invalid ObjectId")

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one_raises)

    resp = client.get("/surveys/invalid-id-format")
    assert resp.status_code == 400
    assert resp.json().get("detail") == "Invalid survey ID format"


@pytest.mark.asyncio
async def test_get_survey_with_all_fields(monkeypatch):
    """Test retrieving a survey with all optional fields populated."""
    object_id = ObjectId()
    fake_doc = {
        "_id": object_id,
        "title": "Detailed Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Question 1?",
                "component": "text",
            },
            {
                "id": "q2",
                "questionText": "Question 2?",
                "component": "radio",
            }
        ],
        "created_by_id": str(fake_user.id),
        "created_by_email": fake_user.email,
        "is_public": True,
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id and query.get("created_by_id") == str(fake_user.id):
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    resp = client.get(f"/surveys/{str(object_id)}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(object_id)
    assert data["title"] == "Detailed Survey"
    assert len(data["questions"]) == 2
    assert data["is_public"] is True

@pytest.mark.asyncio
async def test_delete_survey_success(monkeypatch):
    """Test successfully deleting a survey owned by the current user."""
    object_id = ObjectId()
    
    class FakeDeleteResult:
        deleted_count = 1
    
    async def fake_delete_one(query):
        if query.get("_id") == object_id and query.get("created_by") == str(fake_user.id):
            return FakeDeleteResult()
        return FakeDeleteResult()
    
    monkeypatch.setattr(surveys_collection, "delete_one", fake_delete_one)
    
    resp = client.delete(f"/surveys/{str(object_id)}")
    assert resp.status_code == 200
    assert resp.json().get("message") == "Survey deleted successfully"


@pytest.mark.asyncio
async def test_delete_survey_not_found(monkeypatch):
    """Test deleting a non-existent survey."""
    class FakeDeleteResult:
        deleted_count = 0
    
    async def fake_delete_one(query):
        return FakeDeleteResult()
    
    monkeypatch.setattr(surveys_collection, "delete_one", fake_delete_one)
    
    some_id = str(ObjectId())
    resp = client.delete(f"/surveys/{some_id}")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Survey not found or access denied"


@pytest.mark.asyncio
async def test_delete_survey_unauthorized_access(monkeypatch):
    """Test deleting a survey owned by another user."""
    object_id = ObjectId()
    
    class FakeDeleteResult:
        deleted_count = 0
    
    async def fake_delete_one(query):
        # Survey exists but created_by doesn't match
        if query.get("_id") == object_id and query.get("created_by") == str(fake_user.id):
            return FakeDeleteResult()
        return FakeDeleteResult()
    
    monkeypatch.setattr(surveys_collection, "delete_one", fake_delete_one)
    
    resp = client.delete(f"/surveys/{str(object_id)}")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Survey not found or access denied"


@pytest.mark.asyncio
async def test_delete_survey_invalid_id_format(monkeypatch):
    """Test deleting a survey with an invalid ObjectId format."""
    async def fake_delete_one_raises(query):
        raise Exception("Invalid ObjectId")
    
    monkeypatch.setattr(surveys_collection, "delete_one", fake_delete_one_raises)
    
    resp = client.delete("/surveys/invalid-id-format")
    assert resp.status_code == 400
    assert resp.json().get("detail") == "Invalid survey ID format"