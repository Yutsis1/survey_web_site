from ..db.mongoDB import surveys_collection

async def run_migrations() -> None:
    # Example migration: ensure index on survey title
    await surveys_collection.create_index("title", unique=True)
