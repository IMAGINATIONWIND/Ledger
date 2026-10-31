import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """Return a new psycopg2 connection using the DATABASE_URL env var."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
