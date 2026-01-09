from pymongo import MongoClient
from app.core.config import settings

# MongoDB connection
mongo_client = MongoClient(settings.MONGODB_URL)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]

# Collections
verification_logs = mongo_db.verification_logs
supply_chain_events = mongo_db.supply_chain_events
daily_analytics = mongo_db.daily_analytics


def get_mongo_db():
    """Get MongoDB database instance"""
    return mongo_db
