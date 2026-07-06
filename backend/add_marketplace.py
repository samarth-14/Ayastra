"""
Idempotent migration for the Scrap Marketplace feature.

- Creates the new tables (scrap_inventory, scrap_inventory_images,
  buyer_prices, buyer_price_images) via SQLAlchemy metadata.
- Adds the new profile columns to the existing companies/users tables
  (city, state, contact_number) — create_all does NOT alter existing tables.

Works for both SQLite (dev) and PostgreSQL (Supabase/prod). Run once:

    python add_marketplace.py
"""
import os
from sqlalchemy import create_engine, inspect, text

from models import Base  # noqa: F401  (registers all tables/metadata)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ayastra.db")
IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
)

# New columns to add to existing tables: (table, column, sql type)
NEW_COLUMNS = [
    ("companies", "city", "VARCHAR"),
    ("companies", "state", "VARCHAR"),
    ("users", "contact_number", "VARCHAR"),
]


def main():
    # 1) Create any missing tables (new marketplace tables).
    Base.metadata.create_all(bind=engine)
    print("✓ Ensured all tables exist (new marketplace tables created if missing).")

    # 2) Add missing columns to existing tables.
    insp = inspect(engine)
    with engine.begin() as conn:
        for table, column, coltype in NEW_COLUMNS:
            if not insp.has_table(table):
                print(f"… table '{table}' does not exist yet — skipped (create_all will cover it).")
                continue
            existing = {c["name"] for c in insp.get_columns(table)}
            if column in existing:
                print(f"• {table}.{column} already present — skipped.")
                continue
            conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {coltype}'))
            print(f"✓ Added {table}.{column}")

    print("\nMigration complete.")


if __name__ == "__main__":
    main()
