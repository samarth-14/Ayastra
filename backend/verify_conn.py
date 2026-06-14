import os
from dotenv import load_dotenv
load_dotenv()

db_url = os.getenv("DATABASE_URL", "sqlite:///./ayastra.db")
print("Using:", db_url[:30])

from sqlalchemy import create_engine, text
engine = create_engine(db_url)
with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"))
    print("Public tables:", result.fetchone()[0])