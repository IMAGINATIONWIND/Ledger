import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from db.connection import get_connection

router = APIRouter(prefix="/import", tags=["import"])

# Expected columns in the uploaded file
REQUIRED_COLUMNS = {"logged_on", "exercise", "category", "sets", "reps", "weight_kg"}
OPTIONAL_COLUMNS = {"notes"}


def parse_file(file: UploadFile) -> pd.DataFrame:
    """Read CSV or Excel into a DataFrame."""
    content = file.file.read()
    filename = file.filename.lower()

    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
    elif filename.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(content))
    else:
        raise HTTPException(status_code=400, detail="Only .csv, .xlsx, or .xls files accepted")

    return df


def validate(df: pd.DataFrame) -> list[dict]:
    """Validate column names, types, and constraints. Return cleaned rows."""
    # Normalise column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required columns: {', '.join(missing)}"
        )

    # Drop rows where any required field is blank
    df = df.dropna(subset=list(REQUIRED_COLUMNS))

    # Type coercions
    df["logged_on"]  = pd.to_datetime(df["logged_on"]).dt.date
    df["sets"]       = df["sets"].astype(int)
    df["reps"]       = df["reps"].astype(int)
    df["weight_kg"]  = df["weight_kg"].astype(float)

    # Constraint checks
    if (df["sets"] <= 0).any() or (df["reps"] <= 0).any():
        raise HTTPException(status_code=422, detail="sets and reps must be positive integers")
    if (df["weight_kg"] < 0).any():
        raise HTTPException(status_code=422, detail="weight_kg cannot be negative")

    # Add notes column if absent
    if "notes" not in df.columns:
        df["notes"] = None

    return df[["logged_on", "exercise", "category", "sets", "reps", "weight_kg", "notes"]].to_dict("records")


@router.post("/preview")
async def preview_import(file: UploadFile = File(...)):
    """
    Validate the file and return a preview (first 20 rows).
    Does NOT insert anything into the database yet.
    """
    df = parse_file(file)
    rows = validate(df)
    return {
        "total_rows": len(rows),
        "preview": rows[:20]
    }


@router.post("/confirm")
async def confirm_import(file: UploadFile = File(...)):
    """
    Validate and bulk-insert all rows into the workouts table.
    Call this after the user has reviewed the /preview response.
    """
    df = parse_file(file)
    rows = validate(df)

    sql = """
        INSERT INTO workouts (logged_on, exercise, category, sets, reps, weight_kg, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.executemany(sql, [
                (r["logged_on"], r["exercise"], r["category"],
                 r["sets"], r["reps"], r["weight_kg"], r["notes"])
                for r in rows
            ])
            conn.commit()

    return {"inserted": len(rows), "message": "Import successful"}
