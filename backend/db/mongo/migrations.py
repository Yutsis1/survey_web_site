from backend.db.mongo.mongoDB import surveys_collection
from backend.config.settings import MIGRATION_STRATEGY
from pymongo.errors import OperationFailure

INDEX_NAME = "uniq_title"
INDEX_KEYS = [("title", 1)]
INDEX_OPTIONS = {
    "name": INDEX_NAME,
    "unique": True,
    # Allowed in partial indexes; excludes "" and anything not a string.
    "partialFilterExpression": {"title": {"$gt": ""}},
}

async def _indexes_by_name(col):
    return {idx["name"]: idx async for idx in col.list_indexes()}

def _keys_match(idx_doc):
    # Motor returns {"key": {"title": 1}}
    key = idx_doc.get("key", {})
    return key == {"title": 1}

def _spec_matches(idx_doc):
    return (
        _keys_match(idx_doc)
        and bool(idx_doc.get("unique")) is True
        and idx_doc.get("partialFilterExpression") == INDEX_OPTIONS["partialFilterExpression"]
    )

async def run_migrations() -> None:
    """
    Idempotent index ensure + optional legacy cleanup based on MIGRATION_STRATEGY.
    Creates/repairs a unique *partial* index on surveys.title to allow many null/missing/empty titles
    while enforcing uniqueness for real titles.
    """
    existing = await _indexes_by_name(surveys_collection)

    # If our desired index already exists with the exact spec, we’re done.
    if INDEX_NAME in existing and _spec_matches(existing[INDEX_NAME]):
        print("Title index already correct; skipping creation.")
        return

    # Optional: legacy cleanup only if requested and there are many problematic docs.
    # (Partial index makes this unnecessary for correctness, but you kept this feature.)
    if MIGRATION_STRATEGY in {"update", "delete"}:
        null_title_docs = await surveys_collection.find({"title": None}).to_list(length=None)
        missing_title_docs = await surveys_collection.find({"title": {"$exists": False}}).to_list(length=None)
        total_problematic_docs = len(null_title_docs) + len(missing_title_docs)

        if total_problematic_docs > 1:
            if MIGRATION_STRATEGY == "update":
                print(f"Found {total_problematic_docs} documents with null/missing titles. Updating with unique titles...")
                # Update null titles
                for i, doc in enumerate(null_title_docs, start=1):
                    await surveys_collection.update_one(
                        {"_id": doc["_id"]}, {"$set": {"title": f"Untitled Survey {i}"}}
                    )
                # Update missing titles (offset to keep uniqueness)
                offset = len(null_title_docs)
                for i, doc in enumerate(missing_title_docs, start=1):
                    await surveys_collection.update_one(
                        {"_id": doc["_id"]}, {"$set": {"title": f"Untitled Survey {offset + i}"}}
                    )
            elif MIGRATION_STRATEGY == "delete":
                print(f"Found {total_problematic_docs} documents with null/missing titles. Deleting to avoid conflicts...")
                await surveys_collection.delete_many({"title": None})
                await surveys_collection.delete_many({"title": {"$exists": False}})

    # If an old auto-named index exists (e.g., "title_1") or a mismatched version of our name, drop it first.
    to_drop = []
    if INDEX_NAME in existing and not _spec_matches(existing[INDEX_NAME]):
        to_drop.append(INDEX_NAME)
    if "title_1" in existing:  # common legacy auto-name
        to_drop.append("title_1")

    for name in to_drop:
        print(f"Dropping legacy index {name} …")
        try:
            await surveys_collection.drop_index(name)
        except OperationFailure as e:
            print(f"Warning: drop_index({name}) failed: {e}. Continuing…")

    # Create the correct index (idempotent now that names/specs are handled)
    print("Creating unique partial index on title field …")
    try:
        await surveys_collection.create_index(INDEX_KEYS, **INDEX_OPTIONS)
    except OperationFailure as e:
        # If a race created the same index between list & create, ignore the conflict.
        if getattr(e, "code", None) == 86:
            print("Index already exists with a compatible name; continuing.")
        else:
            raise

    print("Migration completed successfully!")