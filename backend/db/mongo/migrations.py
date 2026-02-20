import logging

from backend.config.settings import MONGO_MIGRATION_STRATEGY
from backend.db.mongo.mongoDB import surveys_collection
from pymongo.errors import OperationFailure

logger = logging.getLogger(__name__)

INDEX_NAME = "uniq_owner_title"
INDEX_KEYS = [("created_by_id", 1), ("title", 1)]
INDEX_OPTIONS = {
    "name": INDEX_NAME,
    "unique": True,
    "partialFilterExpression": {
        "created_by_id": {"$type": "string", "$gt": ""},
        "title": {"$type": "string", "$gt": ""},
    },
}


async def _indexes_by_name(col):
    return {idx["name"]: idx async for idx in col.list_indexes()}


def _keys_match(idx_doc):
    key = idx_doc.get("key", {})
    return key == {"created_by_id": 1, "title": 1}


def _spec_matches(idx_doc):
    return (
        _keys_match(idx_doc)
        and bool(idx_doc.get("unique")) is True
        and idx_doc.get("partialFilterExpression")
        == INDEX_OPTIONS["partialFilterExpression"]
    )


async def _cleanup_problematic_titles() -> None:
    null_title_docs = await surveys_collection.find({"title": None}).to_list(length=None)
    missing_title_docs = await surveys_collection.find({"title": {"$exists": False}}).to_list(length=None)
    empty_title_docs = await surveys_collection.find({"title": ""}).to_list(length=None)

    problematic_docs = null_title_docs + missing_title_docs + empty_title_docs
    if not problematic_docs:
        return

    logger.info(
        "Found %s documents with null/missing/empty titles.",
        len(problematic_docs),
    )

    if MONGO_MIGRATION_STRATEGY == "update":
        for doc in problematic_docs:
            await surveys_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"title": f"Untitled Survey {doc['_id']}"}},
            )
    elif MONGO_MIGRATION_STRATEGY == "delete":
        await surveys_collection.delete_many({"_id": {"$in": [doc["_id"] for doc in problematic_docs]}})


async def _cleanup_duplicate_owner_titles() -> None:
    pipeline = [
        {
            "$match": {
                "created_by_id": {"$type": "string", "$gt": ""},
                "title": {"$type": "string", "$gt": ""},
            }
        },
        {
            "$group": {
                "_id": {"created_by_id": "$created_by_id", "title": "$title"},
                "count": {"$sum": 1},
                "docs": {"$push": "$_id"},
            }
        },
        {"$match": {"count": {"$gt": 1}}},
    ]

    duplicates = await surveys_collection.aggregate(pipeline).to_list(length=None)
    if not duplicates:
        return

    logger.info("Found duplicate survey titles for %s owner/title pairs.", len(duplicates))

    for dup in duplicates:
        docs_sorted = sorted(dup["docs"])
        to_keep = docs_sorted[0]
        to_process = docs_sorted[1:]
        title = dup["_id"]["title"]

        if MONGO_MIGRATION_STRATEGY == "delete":
            await surveys_collection.delete_many({"_id": {"$in": to_process}})
            logger.debug(
                "Deleted %s duplicates for owner %s and title '%s', keeping %s",
                len(to_process),
                dup["_id"]["created_by_id"],
                title,
                to_keep,
            )
        elif MIGRATION_STRATEGY == "update":
            for i, doc_id in enumerate(to_process, start=1):
                new_title = f"{title} (Duplicate {i}-{str(doc_id)[-6:]})"
                await surveys_collection.update_one(
                    {"_id": doc_id},
                    {"$set": {"title": new_title}},
                )


async def run_migrations() -> None:
    """
    Idempotent index migration.
    Ensures a unique partial index on (created_by_id, title) so titles are unique per user.
    """
    existing = await _indexes_by_name(surveys_collection)

    if INDEX_NAME in existing and _spec_matches(existing[INDEX_NAME]):
        logger.info("Owner/title index already correct; skipping creation.")
        return

    logger.info("Using migration strategy '%s'.", MONGO_MIGRATION_STRATEGY)

    if MONGO_MIGRATION_STRATEGY in {"update", "delete"}:
        await _cleanup_problematic_titles()
        await _cleanup_duplicate_owner_titles()
    else:
        logger.info(
            "No legacy cleanup executed; migration strategy '%s' skips cleanup.",
            MONGO_MIGRATION_STRATEGY,
        )

    to_drop = set()
    if INDEX_NAME in existing and not _spec_matches(existing[INDEX_NAME]):
        to_drop.add(INDEX_NAME)

    for legacy_name in ("uniq_title", "title_1", "created_by_id_1_title_1"):
        if legacy_name in existing and legacy_name != INDEX_NAME:
            to_drop.add(legacy_name)

    for name in to_drop:
        logger.info("Dropping legacy index %s ...", name)
        try:
            await surveys_collection.drop_index(name)
        except OperationFailure as e:
            logger.warning("drop_index(%s) failed: %s. Continuing...", name, e)

    logger.info("Creating unique partial index on created_by_id and title...")
    try:
        await surveys_collection.create_index(INDEX_KEYS, **INDEX_OPTIONS)
    except OperationFailure as e:
        if getattr(e, "code", None) == 86:
            logger.info("Index already exists with a compatible name; continuing.")
        else:
            raise

    logger.info("Migration completed successfully!")
