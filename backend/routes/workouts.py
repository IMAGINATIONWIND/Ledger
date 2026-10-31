from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from db.connection import get_connection

router = APIRouter(prefix="/workouts", tags=["workouts"])


# ---------- Request / Response models ----------

class WorkoutCreate(BaseModel):
    logged_on: date = Field(default_factory=date.today)
    exercise: str
    category: str
    sets: int = Field(gt=0)
    reps: int = Field(gt=0)
    weight_kg: float = Field(ge=0)
    notes: Optional[str] = None


# ---------- Routes ----------

@router.get("/")
def list_workouts(exercise: Optional[str] = None,
                  from_date: Optional[date] = None,
                  to_date: Optional[date] = None):
    """Return all workout rows, with optional filters."""
    query = "SELECT * FROM workouts WHERE TRUE"
    params = []

    if exercise:
        params.append(exercise)
        query += f" AND exercise = %s"
    if from_date:
        params.append(from_date)
        query += f" AND logged_on >= %s"
    if to_date:
        params.append(to_date)
        query += f" AND logged_on <= %s"

    query += " ORDER BY logged_on DESC, id DESC"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()


@router.post("/", status_code=201)
def create_workout(payload: WorkoutCreate):
    """Log a new workout set."""
    sql = """
        INSERT INTO workouts (logged_on, exercise, category, sets, reps, weight_kg, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                payload.logged_on, payload.exercise, payload.category,
                payload.sets, payload.reps, payload.weight_kg, payload.notes
            ))
            conn.commit()
            return cur.fetchone()


@router.delete("/{workout_id}", status_code=204)
def delete_workout(workout_id: int):
    """Remove a logged set by ID."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM workouts WHERE id = %s RETURNING id", (workout_id,))
            conn.commit()
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Workout not found")


@router.get("/exercises")
def list_exercises():
    """Return all exercises from the master table."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM exercises ORDER BY muscle_group, name")
            return cur.fetchall()
