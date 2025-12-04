import logging

from backend.db.mongo.mongoDB import surveys_collection
from backend.config.settings import MIGRATION_STRATEGY
from pymongo.errors import OperationFailure

logger = logging.getLogger(__name__)

INDEX_NAME = "uniq_title"
INDEX_KEYS = [("title", 1)]
INDEX_OPTIONS = {
    "name": INDEX_NAME,
    "unique": True,
    "partialFilterExpression": {"title": {"$gt": ""}},
}


async def _indexes_by_name(col):
    return {idx["name"]: idx async for idx in col.list_indexes()}


def _keys_match(idx_doc):
    key = idx_doc.get("key", {})
    return key == {"title": 1}


def _spec_matches(idx_doc):
    return (
        _keys_match(idx_doc)
        and bool(idx_doc.get("unique")) is True
        and idx_doc.get("partialFilterExpression") == INDEX_OPTIONS["partialFilterExpression"]
    )


async def _get_problematic_docs():
    """Fetch documents with null or missing titles."""
    null_title_docs = await surveys_collection.find({"title": None}).to_list(length=None)
    missing_title_docs = await surveys_collection.find({"title": {"$exists": False}}).to_list(length=None)
    return null_title_docs, missing_title_docs


async def _get_duplicate_titles():
    """Find titles that appear more than once."""
    pipeline = [
        {"$match": {"title": {"$type": "string", "$gt": ""}}},
        {"$group": {"_id": "$title", "count": {"$sum": 1}, "docs": {"$push": "$_id"}}},
        {"$match": {"count": {"$gt": 1}}}
    ]
    return await surveys_collection.aggregate(pipeline).to_list(length=None)


async def _strategy_safe():
    """
    Safe strategy: No data modifications.
    Only creates index if it doesn't conflict with existing data.
    """
    logger.info("Running SAFE strategy - no data modifications.")
    
    null_docs, missing_docs = await _get_problematic_docs()
    duplicates = await _get_duplicate_titles()
    
    if null_docs or missing_docs:
        logger.warning(
            "Found %d documents with null/missing titles. "
            "These will be excluded from unique constraint by partial index.",
            len(null_docs) + len(missing_docs)
        )
    
    if duplicates:
        logger.error(
            "Found %d duplicate title groups. Cannot create unique index safely. "
            "Use 'update' or 'delete' strategy to resolve.",
            len(duplicates)
        )
        raise ValueError("Duplicate titles exist. Use 'update' or 'delete' strategy.")


async def _strategy_update():
    """
    Update strategy: Rename problematic documents with unique titles.
    Preserves all data.
    """
    logger.info("Running UPDATE strategy - renaming problematic documents.")
    
    null_docs, missing_docs = await _get_problematic_docs()
    total = len(null_docs) + len(missing_docs)
    
    if total > 0:
        logger.info("Updating %d documents with null/missing titles.", total)
        
        for i, doc in enumerate(null_docs, start=1):
            await surveys_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"title": f"Untitled Survey {i}"}}
            )
        
        offset = len(null_docs)
        for i, doc in enumerate(missing_docs, start=1):
            await surveys_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"title": f"Untitled Survey {offset + i}"}}
            )
    
    # Handle duplicates by renaming
    duplicates = await _get_duplicate_titles()
    if duplicates:
        logger.info("Renaming duplicates in %d title groups.", len(duplicates))
        for dup in duplicates:
            title = dup["_id"]
            docs = sorted(dup["docs"])  # Keep oldest (first ObjectId)
            
            for i, doc_id in enumerate(docs[1:], start=1):
                new_title = f"{title} (Copy {i})"
                await surveys_collection.update_one(
                    {"_id": doc_id},
                    {"$set": {"title": new_title}}
                )
            logger.debug("Renamed %d duplicates for '%s'.", len(docs) - 1, title)


async def _strategy_delete():
    """
    Delete strategy: Remove problematic documents.
    Destructive but ensures clean state.
    """
    logger.info("Running DELETE strategy - removing problematic documents.")
    
    # Delete null/missing titles
    result1 = await surveys_collection.delete_many({"title": None})
    result2 = await surveys_collection.delete_many({"title": {"$exists": False}})
    
    if result1.deleted_count or result2.deleted_count:
        logger.info(
            "Deleted %d documents with null/missing titles.",
            result1.deleted_count + result2.deleted_count
        )
    
    # Delete duplicates (keep oldest)
    duplicates = await _get_duplicate_titles()
    if duplicates:
        total_deleted = 0
        for dup in duplicates:
            title = dup["_id"]
            docs = sorted(dup["docs"])
            to_delete = docs[1:]  # Keep first (oldest)
            
            result = await surveys_collection.delete_many({"_id": {"$in": to_delete}})
            total_deleted += result.deleted_count
            logger.debug("Deleted %d duplicates for '%s'.", len(to_delete), title)
        
        logger.info("Deleted %d duplicate documents total.", total_deleted)


async def _ensure_index(existing: dict):
    """Drop legacy indexes and create the correct one."""
    # Drop mismatched or legacy indexes
    to_drop = []
    if INDEX_NAME in existing and not _spec_matches(existing[INDEX_NAME]):
        to_drop.append(INDEX_NAME)
    if "title_1" in existing:
        to_drop.append("title_1")
    
    for name in to_drop:
        logger.info("Dropping legacy index '%s'.", name)
        try:
            await surveys_collection.drop_index(name)
        except OperationFailure as e:
            logger.warning("drop_index(%s) failed: %s", name, e)
    
    # Create the correct index
    logger.info("Creating unique partial index on title field.")
    try:
        await surveys_collection.create_index(INDEX_KEYS, **INDEX_OPTIONS)
    except OperationFailure as e:
        if getattr(e, "code", None) == 86:
            logger.info("Index already exists with compatible spec.")
        else:
            raise


async def run_migrations() -> None:
    """
    Run migrations based on MIGRATION_STRATEGY setting.
    
    Strategies:
    - 'safe': No data changes, fails if duplicates exist
    - 'update': Renames problematic documents to ensure uniqueness
    - 'delete': Removes problematic documents
    """
    existing = await _indexes_by_name(surveys_collection)
    
    # Check if index already correct
    if INDEX_NAME in existing and _spec_matches(existing[INDEX_NAME]):
        logger.info("Title index already correct; skipping migration.")
        return
    
    logger.info("Running migration with strategy: '%s'", MIGRATION_STRATEGY)
    
    # Execute strategy
    strategies = {
        "safe": _strategy_safe,
        "update": _strategy_update,
        "delete": _strategy_delete,
    }
    
    strategy_fn = strategies.get(MIGRATION_STRATEGY)
    if not strategy_fn:
        logger.error("Unknown migration strategy: '%s'. Using 'safe'.", MIGRATION_STRATEGY)
        strategy_fn = _strategy_safe
    
    await strategy_fn()
    
    # Ensure index exists
    await _ensure_index(existing)
    
    logger.info("Migration completed successfully!")
