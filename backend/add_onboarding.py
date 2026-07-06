"""
One-off migration — add onboarding columns to the existing `users` table.

`Base.metadata.create_all` only creates missing tables; it will NOT add new
columns to a table that already exists. Run this once against the live DB:

    python add_onboarding.py

Idempotent — safe to run multiple times.

Existing rows get is_onboarding_completed = 1 so pre-existing users are treated
as already onboarded and never see the onboarding flow.
"""

import os
import sqlite3

DB_PATH = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "ayastra.db"))


def column_exists(cur, table, column):
    cur.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cur.fetchall())


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    if not column_exists(cur, "users", "is_onboarding_completed"):
        # SQLite can't add a NOT NULL column without a default, so default to 0
        # for the schema, then backfill existing users to 1 (already onboarded).
        cur.execute(
            "ALTER TABLE users ADD COLUMN is_onboarding_completed BOOLEAN NOT NULL DEFAULT 0"
        )
        cur.execute("UPDATE users SET is_onboarding_completed = 1")
        print("Added column: is_onboarding_completed (existing users marked completed)")
    else:
        print("Column already exists: is_onboarding_completed")

    if not column_exists(cur, "users", "marketplace_role"):
        cur.execute("ALTER TABLE users ADD COLUMN marketplace_role VARCHAR(20)")
        print("Added column: marketplace_role")
    else:
        print("Column already exists: marketplace_role")

    conn.commit()
    conn.close()
    print("Done.")


if __name__ == "__main__":
    main()
