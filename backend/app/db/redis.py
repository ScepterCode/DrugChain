import redis
from app.core.config import settings

# Redis connection
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def get_redis():
    """Get Redis client instance"""
    return redis_client
