import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

db_url = os.getenv("DATABASE_URL")
print("Connecting to:", db_url[:40])

# Create engine with explicit schema
engine = create_engine(db_url)

# Import and create all tables
from models import Base
Base.metadata.create_all(bind=engine)
print("Tables created!")

# Verify
with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    ))
    tables = result.fetchall()
    print("Tables in public schema:", [t[0] for t in tables])