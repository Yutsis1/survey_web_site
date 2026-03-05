from backend.routers.auth.auth import get_current_user
from backend.db.sql.sql_driver import get_async_db
from backend.routers.surveys import router
from backend.routers import responses
import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from types import SimpleNamespace
from bson import ObjectId
from fastapi import FastAPI
from pymongo.errors import DuplicateKeyError
from backend.db.mongo.mongoDB import surveys_collection

app = FastAPI()
app.include_router(router)
app.include_router(responses.router)

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


class FakeAsyncCursor:
    def __init__(self, docs):
        self.docs = docs

    def __aiter__(self):
        async def generator():
            for doc in self.docs:
                yield doc

        return generator()


class FakeExecuteResult:
    def __init__(self, item):
        self._item = item

    def scalars(self):
        return self

    def first(self):
        return self._item

    def scalar(self):
        """Return the item directly for count queries."""
        return self._item
    
    def all(self):
        """Return a list for queries that fetch multiple items."""
        if isinstance(self._item, list):
            return self._item
        return []


class FakeAsyncDbSession:
    def __init__(self, execute_item=None):
        self.execute_item = execute_item
        self.added = []

    def add(self, item):
        self.added.append(item)

    async def commit(self):
        return None

    async def refresh(self, item):
        if getattr(item, "id", None) is None:
            item.id = uuid.uuid4()

    async def execute(self, query):
        return FakeExecuteResult(self.execute_item)


# Override the FastAPI dependency
app.dependency_overrides[get_current_user] = fake_get_current_user


def set_db_override(session):
    async def fake_get_db():
        yield session

    app.dependency_overrides[get_async_db] = fake_get_db


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
        "status": "draft",
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
        "status": "published",
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
    assert data["status"] == "published"


@pytest.mark.asyncio
async def test_list_surveys_success(monkeypatch):
    """Test listing surveys owned by the current user."""
    object_id_1 = ObjectId()
    object_id_2 = ObjectId()
    fake_docs = [
        {
            "_id": object_id_1,
            "title": "Survey One",
            "questions": [],
            "created_by_id": str(fake_user.id),
            "created_by_email": fake_user.email,
            "status": "draft",
        },
        {
            "_id": object_id_2,
            "title": "Survey Two",
            "questions": [],
            "created_by_id": str(fake_user.id),
            "created_by_email": fake_user.email,
            "status": "published",
        },
    ]

    def fake_find(query):
        assert query.get("created_by_id") == str(fake_user.id)
        return FakeAsyncCursor(fake_docs)

    monkeypatch.setattr(surveys_collection, "find", fake_find)

    resp = client.get("/surveys/")
    assert resp.status_code == 200
    data = resp.json()
    assert "surveys" in data
    assert len(data["surveys"]) == 2
    assert data["surveys"][0]["id"] == str(object_id_1)
    assert data["surveys"][1]["id"] == str(object_id_2)


@pytest.mark.asyncio
async def test_get_survey_options_success(monkeypatch):
    """Test listing survey options for the current user."""
    object_id = ObjectId()
    fake_docs = [
        {
            "_id": object_id,
            "title": "Preferred Survey",
            "created_by_id": str(fake_user.id),
        },
        {
            "_id": ObjectId(),
            "created_by_id": str(fake_user.id),
        },
    ]

    def fake_find(query):
        assert query.get("created_by_id") == str(fake_user.id)
        return FakeAsyncCursor(fake_docs)

    monkeypatch.setattr(surveys_collection, "find", fake_find)

    resp = client.get("/surveys/options")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["id"] == str(object_id)
    assert data[0]["title"] == "Preferred Survey"
    assert data[1]["title"].startswith("Untitled Survey")


@pytest.mark.asyncio
async def test_get_survey_options_route_is_not_shadowed(monkeypatch):
    """Ensure /surveys/options resolves to the options route, not /surveys/{id}."""
    def fake_find(query):
        return FakeAsyncCursor([])

    monkeypatch.setattr(surveys_collection, "find", fake_find)

    resp = client.get("/surveys/options")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_survey_preserves_dropdown_option_props(monkeypatch):
    """Test dropdown optionProps are preserved during survey creation."""
    inserted_id = ObjectId()

    class FakeInsertResult:
        def __init__(self, result_id):
            self.inserted_id = result_id

    async def fake_insert_one(document):
        question = document.get("questions", [])[0]
        option_props = question.get("option", {}).get("optionProps", {})
        assert option_props.get("selectedOption") == "Medium"
        assert option_props.get("options") == [
            {"label": "Small", "value": "Small"},
            {"label": "Medium", "value": "Medium"},
            {"label": "Large", "value": "Large"},
        ]
        return FakeInsertResult(inserted_id)

    monkeypatch.setattr(surveys_collection, "insert_one", fake_insert_one)

    payload = {
        "title": "Dropdown Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Pick your size",
                "component": "DropDown",
                "option": {
                    "optionProps": {
                        "selectedOption": "Medium",
                        "options": [
                            {"label": "Small", "value": "Small"},
                            {"label": "Medium", "value": "Medium"},
                            {"label": "Large", "value": "Large"},
                        ],
                    }
                },
            }
        ],
    }

    resp = client.post("/surveys/", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"id": str(inserted_id)}


@pytest.mark.asyncio
async def test_create_survey_preserves_checkbox_tiles_option_props(monkeypatch):
    """Test checkbox tiles optionProps are preserved during survey creation."""
    inserted_id = ObjectId()

    class FakeInsertResult:
        def __init__(self, result_id):
            self.inserted_id = result_id

    async def fake_insert_one(document):
        question = document.get("questions", [])[0]
        option_props = question.get("option", {}).get("optionProps", {})
        assert option_props.get("name") == "skills"
        assert option_props.get("buttons") == [
            {"label": "React", "value": "React"},
            {"label": "TypeScript", "value": "TypeScript"},
        ]
        assert option_props.get("selectedValues") == ["React"]
        return FakeInsertResult(inserted_id)

    monkeypatch.setattr(surveys_collection, "insert_one", fake_insert_one)

    payload = {
        "title": "Checkbox Tiles Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Select your skills",
                "component": "CheckboxTiles",
                "option": {
                    "optionProps": {
                        "name": "skills",
                        "buttons": [
                            {"label": "React", "value": "React"},
                            {"label": "TypeScript", "value": "TypeScript"},
                        ],
                        "selectedValues": ["React"],
                    }
                },
            }
        ],
    }

    resp = client.post("/surveys/", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"id": str(inserted_id)}


@pytest.mark.asyncio
async def test_update_survey_success(monkeypatch):
    """Test successfully updating a survey owned by the current user."""
    object_id = ObjectId()

    class FakeUpdateResult:
        matched_count = 1

    async def fake_update_one(query, update):
        assert query.get("_id") == object_id
        assert query.get("created_by_id") == str(fake_user.id)
        assert update.get("$set", {}).get("title") == "Updated Survey"
        assert update.get("$set", {}).get("status") == "published"
        assert update.get("$set", {}).get("layouts", {}).get("lg", [])[0]["i"] == "q1"
        return FakeUpdateResult()

    monkeypatch.setattr(surveys_collection, "update_one", fake_update_one)

    payload = {
        "title": "Updated Survey",
        "status": "published",
        "questions": [
            {
                "id": "q1",
                "questionText": "Updated question?",
                "component": "TextInput",
            }
        ],
        "layouts": {
            "lg": [{"i": "q1", "x": 0, "y": 0, "w": 3, "h": 3}],
            "md": [{"i": "q1", "x": 0, "y": 0, "w": 3, "h": 3}],
            "sm": [{"i": "q1", "x": 0, "y": 0, "w": 3, "h": 3}],
            "xs": [{"i": "q1", "x": 0, "y": 0, "w": 3, "h": 3}],
            "xxs": [{"i": "q1", "x": 0, "y": 0, "w": 2, "h": 3}],
        },
    }

    resp = client.put(f"/surveys/{str(object_id)}", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"id": str(object_id)}


@pytest.mark.asyncio
async def test_update_survey_preserves_dropdown_option_props(monkeypatch):
    """Test dropdown optionProps are preserved during survey update."""
    object_id = ObjectId()

    class FakeUpdateResult:
        matched_count = 1

    async def fake_update_one(query, update):
        assert query.get("_id") == object_id
        question = update.get("$set", {}).get("questions", [])[0]
        option_props = question.get("option", {}).get("optionProps", {})
        assert option_props.get("selectedOption") == "Medium"
        assert option_props.get("options") == [
            {"label": "Small", "value": "Small"},
            {"label": "Medium", "value": "Medium"},
            {"label": "Large", "value": "Large"},
        ]
        return FakeUpdateResult()

    monkeypatch.setattr(surveys_collection, "update_one", fake_update_one)

    payload = {
        "title": "Updated Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Pick your size",
                "component": "DropDown",
                "option": {
                    "optionProps": {
                        "selectedOption": "Medium",
                        "options": [
                            {"label": "Small", "value": "Small"},
                            {"label": "Medium", "value": "Medium"},
                            {"label": "Large", "value": "Large"},
                        ],
                    }
                },
            }
        ],
    }

    resp = client.put(f"/surveys/{str(object_id)}", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"id": str(object_id)}


@pytest.mark.asyncio
async def test_update_survey_preserves_checkbox_tiles_option_props(monkeypatch):
    """Test checkbox tiles optionProps are preserved during survey update."""
    object_id = ObjectId()

    class FakeUpdateResult:
        matched_count = 1

    async def fake_update_one(query, update):
        assert query.get("_id") == object_id
        question = update.get("$set", {}).get("questions", [])[0]
        option_props = question.get("option", {}).get("optionProps", {})
        assert option_props.get("name") == "skills"
        assert option_props.get("buttons") == [
            {"label": "React", "value": "React"},
            {"label": "TypeScript", "value": "TypeScript"},
        ]
        assert option_props.get("selectedValues") == ["TypeScript"]
        return FakeUpdateResult()

    monkeypatch.setattr(surveys_collection, "update_one", fake_update_one)

    payload = {
        "title": "Updated Checkbox Tiles Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Select your skills",
                "component": "CheckboxTiles",
                "option": {
                    "optionProps": {
                        "name": "skills",
                        "buttons": [
                            {"label": "React", "value": "React"},
                            {"label": "TypeScript", "value": "TypeScript"},
                        ],
                        "selectedValues": ["TypeScript"],
                    }
                },
            }
        ],
    }

    resp = client.put(f"/surveys/{str(object_id)}", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"id": str(object_id)}


@pytest.mark.asyncio
async def test_get_survey_preserves_checkbox_tiles_option_props(monkeypatch):
    """Test checkbox tiles optionProps are preserved during survey retrieval."""
    object_id = ObjectId()
    fake_doc = {
        "_id": object_id,
        "title": "Checkbox Tiles Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Select your skills",
                "component": "CheckboxTiles",
                "option": {
                    "optionProps": {
                        "name": "skills",
                        "buttons": [
                            {"label": "React", "value": "React"},
                            {"label": "TypeScript", "value": "TypeScript"},
                        ],
                        "selectedValues": ["React"],
                        "test_id": "skills-tiles",
                    }
                },
            }
        ],
        "created_by_id": str(fake_user.id),
        "created_by_email": fake_user.email,
        "status": "draft",
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id and query.get("created_by_id") == str(fake_user.id):
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    resp = client.get(f"/surveys/{str(object_id)}")
    assert resp.status_code == 200
    data = resp.json()
    option_props = data["questions"][0]["option"]["optionProps"]
    assert option_props["name"] == "skills"
    assert option_props["selectedValues"] == ["React"]
    assert option_props["test_id"] == "skills-tiles"


@pytest.mark.asyncio
async def test_update_survey_not_found(monkeypatch):
    """Test updating a non-existent survey."""

    class FakeUpdateResult:
        matched_count = 0

    async def fake_update_one(query, update):
        return FakeUpdateResult()

    monkeypatch.setattr(surveys_collection, "update_one", fake_update_one)

    payload = {
        "title": "Missing Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Question?",
                "component": "TextInput",
            }
        ],
    }

    resp = client.put(f"/surveys/{str(ObjectId())}", json=payload)
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Survey not found or access denied"


@pytest.mark.asyncio
async def test_update_survey_invalid_id_format():
    """Test updating a survey with invalid id format."""
    payload = {
        "title": "Any Survey",
        "questions": [
            {
                "id": "q1",
                "questionText": "Question?",
                "component": "TextInput",
            }
        ],
    }
    resp = client.put("/surveys/not-an-object-id", json=payload)
    assert resp.status_code == 400
    assert resp.json().get("detail") == "Invalid survey ID format"


@pytest.mark.asyncio
async def test_update_survey_duplicate_title_conflict(monkeypatch):
    """Test updating a survey to an already used title for the same owner."""

    async def fake_update_one(query, update):
        raise DuplicateKeyError("duplicate key error")

    monkeypatch.setattr(surveys_collection, "update_one", fake_update_one)

    payload = {
        "title": "Duplicate Title",
        "questions": [
            {
                "id": "q1",
                "questionText": "Question?",
                "component": "TextInput",
            }
        ],
    }

    resp = client.put(f"/surveys/{str(ObjectId())}", json=payload)
    assert resp.status_code == 409
    assert resp.json().get("detail") == "Survey title already exists for this user"


@pytest.mark.asyncio
async def test_delete_survey_success(monkeypatch):
    """Test successfully deleting a survey owned by the current user."""
    object_id = ObjectId()
    
    class FakeDeleteResult:
        deleted_count = 1
    
    async def fake_delete_one(query):
        if query.get("_id") == object_id and query.get("created_by_id") == str(fake_user.id):
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
        # Survey exists but created_by_id doesn't match
        if query.get("_id") == object_id and query.get("created_by_id") == str(fake_user.id):
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


@pytest.mark.asyncio
async def test_get_public_survey_only_for_published(monkeypatch):
    object_id = ObjectId()

    published_doc = {
        "_id": object_id,
        "title": "Public Survey",
        "status": "published",
        "questions": [],
        "layouts": {"lg": [], "md": [], "sm": [], "xs": [], "xxs": []},
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id:
            return published_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    ok_resp = client.get(f"/surveys/public/{str(object_id)}")
    assert ok_resp.status_code == 200
    assert ok_resp.json()["status"] == "published"

    draft_id = ObjectId()
    draft_doc = {
        "_id": draft_id,
        "title": "Draft Survey",
        "status": "draft",
        "questions": [],
        "layouts": {"lg": [], "md": [], "sm": [], "xs": [], "xxs": []},
    }

    async def fake_find_one_draft(query):
        if query.get("_id") == draft_id:
            return draft_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one_draft)
    denied_resp = client.get(f"/surveys/public/{str(draft_id)}")
    assert denied_resp.status_code == 404


@pytest.mark.asyncio
async def test_submit_response_published_survey(monkeypatch):
    object_id = ObjectId()
    fake_doc = {
        "_id": object_id,
        "title": "Published Survey",
        "status": "published",
        "created_by_id": str(fake_user.id),
        "questions": [],
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id:
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)
    fake_session = FakeAsyncDbSession()
    set_db_override(fake_session)

    payload = {
        "surveyId": str(object_id),
        "answers": [
            {
                "questionId": "q1",
                "value": "A",
            }
        ],
    }

    resp = client.post(f"/surveys/{str(object_id)}/responses", json=payload)
    assert resp.status_code == 200
    assert "id" in resp.json()
    assert len(fake_session.added) == 1
    assert fake_session.added[0].survey_id == str(object_id)


@pytest.mark.asyncio
async def test_submit_response_draft_survey_forbidden(monkeypatch):
    object_id = ObjectId()
    fake_doc = {
        "_id": object_id,
        "title": "Draft Survey",
        "status": "draft",
        "created_by_id": str(fake_user.id),
        "questions": [],
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id:
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)
    set_db_override(FakeAsyncDbSession())

    payload = {
        "surveyId": str(object_id),
        "answers": [{"questionId": "q1", "value": "A"}],
    }
    resp = client.post(f"/surveys/{str(object_id)}/responses", json=payload)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_get_latest_response_for_owner():
    survey_id = str(ObjectId())
    latest = SimpleNamespace(
        id=uuid.uuid4(),
        survey_id=survey_id,
        survey_owner_id=fake_user.id,
        answers=[{"questionId": "q1", "value": "Most recent"}],
        submitted_at=datetime.now(timezone.utc) + timedelta(minutes=1),
    )
    set_db_override(FakeAsyncDbSession(execute_item=latest))

    resp = client.get(f"/surveys/{survey_id}/responses/latest")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["id"] == str(latest.id)
    assert payload["answers"][0]["value"] == "Most recent"


@pytest.mark.asyncio
async def test_get_response_by_id_scoped_to_survey_and_owner():
    survey_id = str(ObjectId())
    response_id = uuid.uuid4()
    stored = SimpleNamespace(
        id=response_id,
        survey_id=survey_id,
        survey_owner_id=fake_user.id,
        answers=[{"questionId": "q1", "value": True}],
        submitted_at=datetime.now(timezone.utc),
    )
    set_db_override(FakeAsyncDbSession(execute_item=stored))

    ok_resp = client.get(f"/surveys/{survey_id}/responses/{response_id}")
    assert ok_resp.status_code == 200
    assert ok_resp.json()["id"] == str(response_id)

    set_db_override(FakeAsyncDbSession(execute_item=None))
    missing_resp = client.get(f"/surveys/{survey_id}/responses/{response_id}")
    assert missing_resp.status_code == 404


@pytest.mark.asyncio
async def test_create_survey_persists_status_and_layouts(monkeypatch):
    inserted_id = ObjectId()

    class FakeInsertResult:
        def __init__(self, result_id):
            self.inserted_id = result_id

    async def fake_insert_one(document):
        assert document["status"] == "published"
        assert "layouts" in document
        assert document["layouts"]["lg"][0]["i"] == "q1"
        return FakeInsertResult(inserted_id)

    monkeypatch.setattr(surveys_collection, "insert_one", fake_insert_one)

    payload = {
        "title": "Layout Survey",
        "status": "published",
        "questions": [
            {
                "id": "q1",
                "questionText": "Question",
                "component": "TextInput",
                "layout": {"i": "q1", "x": 1, "y": 2, "w": 3, "h": 3},
            }
        ],
        "layouts": {
            "lg": [{"i": "q1", "x": 1, "y": 2, "w": 3, "h": 3}],
            "md": [{"i": "q1", "x": 1, "y": 2, "w": 3, "h": 3}],
            "sm": [{"i": "q1", "x": 1, "y": 2, "w": 3, "h": 3}],
            "xs": [{"i": "q1", "x": 1, "y": 2, "w": 3, "h": 3}],
            "xxs": [{"i": "q1", "x": 0, "y": 2, "w": 2, "h": 3}],
        },
    }

    resp = client.post("/surveys/", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"id": str(inserted_id)}


@pytest.mark.asyncio
async def test_list_responses_paginated(monkeypatch):
    """Test pagination of survey responses."""
    object_id = ObjectId()
    survey_id = str(object_id)
    fake_doc = {
        "_id": object_id,
        "title": "Survey with Responses",
        "status": "published",
        "created_by_id": str(fake_user.id),
        "questions": [],
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id:
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    # Mock database session with paginated responses
    class PaginatedDbSession:
        def __init__(self, responses, total_count):
            self.responses = responses
            self.total_count = total_count
            self.added = []

        def add(self, item):
            self.added.append(item)

        async def commit(self):
            pass

        async def refresh(self, item):
            if getattr(item, "id", None) is None:
                item.id = uuid.uuid4()

        async def execute(self, query):
            # Check if this is a count query
            query_str = str(query)
            if "count" in query_str.lower():
                class CountResult:
                    def scalar(self):
                        return self.value
                    def __init__(self, val):
                        self.value = val
                return CountResult(self.total_count)
            # Otherwise return paginated results
            class AllResult:
                def __init__(self, items):
                    self._items = items
                def scalars(self):
                    return self
                def all(self):
                    return self._items
            return AllResult(self.responses)

    responses = [
        SimpleNamespace(
            id=uuid.uuid4(),
            survey_id=survey_id,
            survey_owner_id=fake_user.id,
            answers=[{"questionId": "q1", "value": f"Answer {i}"}],
            submitted_at=datetime.now(timezone.utc) - timedelta(hours=i),
        )
        for i in range(15)
    ]

    session = PaginatedDbSession(responses[:10], 15)
    set_db_override(session)

    # Test first page
    resp = client.get(f"/surveys/{survey_id}/responses?page=1&page_size=10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total_count"] == 15
    assert len(data["responses"]) == 10


@pytest.mark.asyncio
async def test_list_responses_requires_auth(monkeypatch):
    """Test that listing responses requires authentication and ownership."""
    object_id = ObjectId()
    survey_id = str(object_id)
    different_user_id = str(uuid.uuid4())  # Different from fake_user.id

    async def fake_find_one(query):
        # Survey exists but owned by different user
        if query.get("_id") == object_id:
            # Check if query includes created_by_id (which it should)
            requested_owner = query.get("created_by_id")
            if requested_owner == different_user_id:
                # This is the actual owner
                return {
                    "_id": object_id,
                    "title": "Someone Else's Survey",
                    "status": "published",
                    "created_by_id": different_user_id,
                    "questions": [],
                }
        # No match - query includes fake_user.id but survey owned by different_user_id
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)
    set_db_override(FakeAsyncDbSession())

    # fake_user (current user) tries to access different_user's survey
    resp = client.get(f"/surveys/{survey_id}/responses")
    # Should return 404 since survey with this ID + fake_user.id combo doesn't exist
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_responses_for_owned_survey(monkeypatch):
    """Test that listing responses succeeds for owned surveys."""
    object_id = ObjectId()
    survey_id = str(object_id)
    fake_doc = {
        "_id": object_id,
        "title": "My Survey",
        "status": "published",
        "created_by_id": str(fake_user.id),
        "questions": [],
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id and query.get("created_by_id") == str(fake_user.id):
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)
    
    class SimpleDbSession:
        def __init__(self):
            self.added = []
        
        def add(self, item):
            self.added.append(item)
        
        async def commit(self):
            pass
        
        async def refresh(self, item):
            pass
        
        async def execute(self, query):
            # Return 0 count or empty list
            return FakeExecuteResult(0)
    
    set_db_override(SimpleDbSession())

    resp = client.get(f"/surveys/{survey_id}/responses")
    assert resp.status_code == 200
    data = resp.json()
    assert data["page"] == 1
    assert data["total_count"] == 0


@pytest.mark.asyncio
async def test_get_survey_stats(monkeypatch):
    """Test fetching survey statistics with responses."""
    object_id = ObjectId()
    survey_id = str(object_id)
    fake_doc = {
        "_id": object_id,
        "title": "Stats Survey",
        "status": "published",
        "created_by_id": str(fake_user.id),
        "created_at": datetime(2024, 1, 15, tzinfo=timezone.utc),
        "questions": [
            {"id": "q1", "questionText": "What is your favorite color?"},
            {"id": "q2", "questionText": "Do you like surveys?"},
        ],
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id:
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    # Mock responses
    class StatsDbSession:
        def __init__(self, responses):
            self.responses = responses
            self.added = []

        def add(self, item):
            self.added.append(item)

        async def commit(self):
            pass

        async def refresh(self, item):
            pass

        async def execute(self, query):
            class AllResult:
                def __init__(self, items):
                    self._items = items
                def scalars(self):
                    return self
                def all(self):
                    return self._items
            return AllResult(self.responses)

    responses = [
        SimpleNamespace(
            id=uuid.uuid4(),
            survey_id=survey_id,
            survey_owner_id=fake_user.id,
            answers=[
                {"questionId": "q1", "value": "Blue"},
                {"questionId": "q2", "value": True},
            ],
            submitted_at=datetime(2024, 1, 20, tzinfo=timezone.utc),
        ),
        SimpleNamespace(
            id=uuid.uuid4(),
            survey_id=survey_id,
            survey_owner_id=fake_user.id,
            answers=[
                {"questionId": "q1", "value": "Blue"},
                {"questionId": "q2", "value": False},
            ],
            submitted_at=datetime(2024, 1, 21, tzinfo=timezone.utc),
        ),
        SimpleNamespace(
            id=uuid.uuid4(),
            survey_id=survey_id,
            survey_owner_id=fake_user.id,
            answers=[
                {"questionId": "q1", "value": "Red"},
            ],
            submitted_at=datetime(2024, 1, 21, tzinfo=timezone.utc),
        ),
    ]

    session = StatsDbSession(responses)
    set_db_override(session)

    resp = client.get(f"/surveys/{survey_id}/responses/stats")
    if resp.status_code != 200:
        print(f"Error response: {resp.json()}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["surveyId"] == survey_id
    assert data["title"] == "Stats Survey"
    assert data["responsesCount"] == 3
    assert data["createdDate"] == "2024-01-15"
    
    # Check trend data
    assert len(data["trend"]) == 2  # Two different dates
    assert any(t["date"] == "2024-01-20" and t["responses"] == 1 for t in data["trend"])
    assert any(t["date"] == "2024-01-21" and t["responses"] == 2 for t in data["trend"])
    
    # Check question breakdown
    assert len(data["questionBreakdown"]) == 2
    q1_breakdown = next(q for q in data["questionBreakdown"] if q["questionId"] == "q1")
    assert any(c["option"] == "Blue" and c["count"] == 2 for c in q1_breakdown["counts"])
    assert any(c["option"] == "Red" and c["count"] == 1 for c in q1_breakdown["counts"])


@pytest.mark.asyncio
async def test_get_survey_stats_date_filter(monkeypatch):
    """Test fetching survey statistics with date filtering."""
    object_id = ObjectId()
    survey_id = str(object_id)
    fake_doc = {
        "_id": object_id,
        "title": "Filtered Stats Survey",
        "status": "published",
        "created_by_id": str(fake_user.id),
        "questions": [{"id": "q1", "questionText": "Question"}],
    }

    async def fake_find_one(query):
        if query.get("_id") == object_id:
            return fake_doc
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)

    # Mock responses with different dates
    class FilteredDbSession:
        def __init__(self):
            self.added = []

        def add(self, item):
            self.added.append(item)

        async def commit(self):
            pass

        async def refresh(self, item):
            pass

        async def execute(self, query):
            # Return only responses within date range
            filtered = [
                SimpleNamespace(
                    id=uuid.uuid4(),
                    survey_id=survey_id,
                    survey_owner_id=fake_user.id,
                    answers=[{"questionId": "q1", "value": "Filtered"}],
                    submitted_at=datetime(2024, 1, 21, tzinfo=timezone.utc),
                ),
            ]
            class AllResult:
                def __init__(self, items):
                    self._items = items
                def scalars(self):
                    return self
                def all(self):
                    return self._items
            return AllResult(filtered)

    session = FilteredDbSession()
    set_db_override(session)

    resp = client.get(
        f"/surveys/{survey_id}/responses/stats?start_date=2024-01-21&end_date=2024-01-21"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["responsesCount"] == 1


@pytest.mark.asyncio
async def test_stats_access_control(monkeypatch):
    """Test that users cannot access stats for surveys they don't own."""
    object_id = ObjectId()
    survey_id = str(object_id)
    different_user_id = str(uuid.uuid4())  # Different from fake_user.id

    async def fake_find_one(query):
        # Survey exists but owned by different user
        if query.get("_id") == object_id:
            requested_owner = query.get("created_by_id")
            if requested_owner == different_user_id:
                # This is the actual owner
                return {
                    "_id": object_id,
                    "title": "Private Survey",
                    "status": "published",
                    "created_by_id": different_user_id,
                    "questions": [],
                }
        # No match - survey not found for this user
        return None

    monkeypatch.setattr(surveys_collection, "find_one", fake_find_one)
    set_db_override(FakeAsyncDbSession())

    # fake_user tries to access different_user's stats
    resp = client.get(f"/surveys/{survey_id}/responses/stats")
    assert resp.status_code == 404
