
import os
from pathlib import Path
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

base = Path(__file__).parent
load_dotenv(base.parent / ".env")  

DATABASE_URL = os.getenv("DATABASE_URL")
CSV = base / "notes.csv"

df = pd.read_csv(CSV)

df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)

print(df.head())


engine = create_engine(DATABASE_URL)

with engine.begin() as con:
    con.execute(text("""
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY,
      site TEXT NOT NULL,
      equipment TEXT NOT NULL,
      variable TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      author TEXT NOT NULL,
      message TEXT NOT NULL
    );
    """))
    con.execute(text("DELETE FROM notes;"))

df[["id", "site", "equipment", "variable", "timestamp", "author", "message"]].to_sql(
    "notes", engine, if_exists="append", index=False
)

with engine.connect() as con:
    total = con.execute(text("SELECT COUNT(*) FROM notes")).scalar()
print(f"{total} linhas inseridas em {DATABASE_URL.split('@')[-1]}")
