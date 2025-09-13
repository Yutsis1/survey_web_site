from backend.db.mongo.mongoDB import surveys_collection
from backend.config.settings import MIGRATION_STRATEGY

async def run_migrations() -> None:
    """
    Asynchronously runs database migrations for the surveys collection.
    This function checks if a unique index on the 'title' field already exists in the surveys_collection.
    If the index does not exist, it identifies documents with null or missing 'title' fields that could cause
    conflicts during index creation. Based on the 'MIGRATION_STRATEGY' environment variable (defaulting to 'delete'),
    it either:
    - Updates problematic documents with unique titles (e.g., "Untitled Survey 1").
    - Deletes problematic documents.
    - Skips the migration if the strategy is invalid or not set, to prevent data loss.
    Finally, it creates a sparse unique index on the 'title' field to allow null values while enforcing uniqueness
    for non-null titles.
    Environment Variables:
        MIGRATION_STRATEGY (str): Strategy to handle documents with null/missing titles.
            - 'update': Update documents with unique titles.
            - 'delete': Delete problematic documents.
            - Other: Skip migration and print a warning. Use 'safe' to avoid data loss.
    Notes:
        - Requires access to 'surveys_collection' (assumed to be a MongoDB collection object).
        - Prints status messages to the console for logging purposes.
        - Sparse index ensures null values are ignored, preventing conflicts.
    Returns:
        None
    """
    # Check if the unique index already exists
    existing_indexes = await surveys_collection.list_indexes().to_list(length=None)
    
    # Look for existing title index
    title_index_exists = False
    for index in existing_indexes:
        # Check if it's the title index
        if index.get("key", {}).get("title") == 1 and index.get("unique") == True:
            title_index_exists = True
            break
    
    if title_index_exists:
        # Check if there are documents with null titles that would cause conflicts
        null_title_docs = await surveys_collection.find({"title": None}).to_list(length=None)
        missing_title_docs = await surveys_collection.find({"title": {"$exists": False}}).to_list(length=None)
        
        total_problematic_docs = len(null_title_docs) + len(missing_title_docs)
        
        if total_problematic_docs > 1:
            # Check environment variable for migration strategy
            migration_strategy = MIGRATION_STRATEGY

            # Check strategy and what to do for existing data
            if migration_strategy == "update":
                print(f"Found {total_problematic_docs} documents with null/missing titles. Updating with unique titles...")
                
                # Update null titles
                for i, doc in enumerate(null_title_docs):
                    # Potentially can fail if there are many documents, but for pet purposes it's fine
                    await surveys_collection.update_one(
                        {"_id": doc["_id"]}, 
                        {"$set": {"title": f"Untitled Survey {i + 1}"}}
                    )
                
                # Update missing titles
                for i, doc in enumerate(missing_title_docs):
                    # Offset by the number of null title docs to ensure uniqueness
                    # Potentially can fail if there are many documents, but for pet purposes it's fine
                    await surveys_collection.update_one(
                        {"_id": doc["_id"]}, 
                        {"$set": {"title": f"Untitled Survey {len(null_title_docs) + i + 1}"}}
                    )
                    
            elif migration_strategy == "delete":
                print(f"Found {total_problematic_docs} documents with null/missing titles. Deleting to avoid conflicts...")
                await surveys_collection.delete_many({"title": None})
                await surveys_collection.delete_many({"title": {"$exists": False}})
            else:
                print(f"Found {total_problematic_docs} documents with null/missing titles.")
                print("Set MIGRATION_STRATEGY environment variable to 'update' or 'delete' to handle them.")
                print("Skipping migration to avoid data loss.")
                return
        
        # Create a sparse unique index (ignores null values)
        print("Creating unique sparse index on title field...")
        await surveys_collection.create_index("title", unique=True, sparse=True)
        print("Migration completed successfully!")
    else:
        print("Title index already exists, skipping migration.")
