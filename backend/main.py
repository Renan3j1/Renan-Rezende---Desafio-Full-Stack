import os
from pathlib import Path
from datetime import datetime
from uuid import UUID, uuid4
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from sqlalchemy import create_engine, text

load_dotenv(Path(__file__).parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

app = FastAPI(title="Notescreen API")

# RETORNA TODAS AS NOTAS COM FILTROS OPCIONAIS DE SITE, EQUIPAMENTO, DATA INICIAL E DATA FINAL, PAGINAÇÃO.
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


# --------------------------------------------------------------------------------------

# CRIA UMA NOTA.
@app.post("/api/v1/notes")
def create_note(note: dict):
    fields = ["site", "equipment", "variable", "timestamp", "author", "message"]
    if any(field not in note for field in fields):
        return "FALTA UM CAMPO NA REQUISIÇÃO"

    note_id = uuid4()
    query = text(
        "INSERT INTO notes (id, site, equipment, variable, timestamp, author, message) "
        "VALUES (:id, :site, :equipment, :variable, :timestamp, :author, :message) "
        "RETURNING id, site, equipment, variable, timestamp, author, message"
    )
    params = {"id": note_id, **note}

    with engine.begin() as con:
        row = con.execute(query, params).mappings().one()

    return dict(row)

# --------------------------------------------------------------------------------------

# DELETA UMA NOTA PELO ID.
@app.delete("/api/v1/notes/{note_id}")
def delete_note(note_id: UUID):
    
    with engine.begin() as con:
        result = con.execute(
            text("DELETE FROM notes WHERE id = :id"),
            {"id": note_id},
        )

    if result.rowcount == 0:
        return "NOTA NÃO ENCONTRADA"

    return "NOTA DELETADA"
# --------------------------------------------------------------------------------------

# ATUALIZA UMA NOTA PELO ID.
@app.put("/api/v1/notes/{note_id}")
def update_note(note_id: UUID, note: dict):
    fields = ["site", "equipment", "variable", "timestamp", "author", "message"]
    if any(field not in note for field in fields):
        return "FALTA UM CAMPO NA REQUISIÇÃO"

    query = text(
        "UPDATE notes SET site = :site, equipment = :equipment, "
        "variable = :variable, timestamp = :timestamp, author = :author, "
        "message = :message WHERE id = :id "
        "RETURNING id, site, equipment, variable, timestamp, author, message"
    )
    params = {"id": note_id, **note}

    with engine.begin() as con:
        row = con.execute(query, params).mappings().one_or_none()

    if row is None:
        return "NOTA NÃO ENCONTRADA"

    return dict(row)
