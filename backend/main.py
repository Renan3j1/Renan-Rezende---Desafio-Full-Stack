import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from sqlalchemy import create_engine, text

load_dotenv(Path(__file__).parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

app = FastAPI(title="Notescreen API")


@app.get("/api/v1/notes")
def list_all_notes(
    site: str | None = None,
    equipment: str | None = None,
    startDate: str | None = None,
    endDate: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    query = (
        "SELECT id, site, equipment, variable, timestamp, author, message "
        "FROM notes WHERE 1=1"
    )
    params: dict = {}
    if site:
        query += " AND site = :site"
        params["site"] = site
    if equipment:
        query += " AND equipment = :equipment"
        params["equipment"] = equipment
    if startDate:
        query += " AND timestamp >= CAST(:startDate AS TIMESTAMPTZ)"
        params["startDate"] = startDate
    if endDate:
        query += " AND timestamp < CAST(:endDate AS DATE) + INTERVAL '1 day'"
        params["endDate"] = endDate
  
    offset = (page - 1) * page_size

    query += f" LIMIT {page_size} OFFSET {offset}"

    params["limit"] = page_size + 1

    params["offset"] = offset

    with engine.connect() as con:
        rows = con.execute(text(query), params).mappings().all()

    has_next = len(rows) > page_size
    items = [dict(row) for row in rows[:page_size]]

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "has_next": has_next,
    }

# GET para /api/v1/notes?site=SP&page=2&page_size=20