"""Seed the database with demo leads: `python seed.py` (skips if not empty)."""

from app.seed_data import seed_if_empty

if __name__ == "__main__":
    added = seed_if_empty()
    print(f"Seeded {added} demo leads." if added else "Database already has leads — nothing to do.")
