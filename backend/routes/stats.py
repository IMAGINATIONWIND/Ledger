from fastapi import APIRouter
from db.connection import get_connection

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/weekly")
def weekly_volume():
    """Weekly volume totals — reads from the weekly_volume view."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM weekly_volume ORDER BY week_start DESC LIMIT 12")
            return cur.fetchall()


@router.get("/monthly")
def monthly_volume():
    """Monthly volume totals — reads from the monthly_volume view."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM monthly_volume ORDER BY month_start DESC LIMIT 12")
            return cur.fetchall()


@router.get("/progression/{exercise}")
def exercise_progression(exercise: str):
    """
    Max weight per day for a given exercise.
    Also returns 7-day moving average computed in SQL.
    """
    sql = """
        WITH daily_max AS (
            SELECT
                exercise,
                logged_on,
                MAX(weight_kg) AS max_weight_kg
            FROM workouts
            WHERE exercise = %s
            GROUP BY exercise, logged_on
        )
        SELECT
            logged_on,
            max_weight_kg,
            ROUND(
                AVG(max_weight_kg) OVER (
                    ORDER BY logged_on
                    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
                ),
                2
            ) AS moving_avg_7d
        FROM daily_max
        ORDER BY logged_on
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (exercise,))
            return cur.fetchall()


@router.get("/prs")
def personal_records():
    """Personal records per exercise — reads from the personal_records view."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM personal_records ORDER BY exercise")
            return cur.fetchall()


@router.get("/category-breakdown")
def category_breakdown():
    """Volume split by training category — reads from the category_breakdown view."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM category_breakdown")
            return cur.fetchall()


@router.get("/recent-sessions")
def recent_sessions():
    """Last 10 training days — reads from the recent_sessions view."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM recent_sessions")
            return cur.fetchall()


@router.get("/streak")
def training_streak():
    """
    Current and historical training streaks.
    Uses LAG() + date arithmetic — pure SQL.
    """
    sql = """
        WITH dated AS (
            SELECT DISTINCT logged_on FROM workouts ORDER BY logged_on
        ),
        gaps AS (
            SELECT
                logged_on,
                logged_on - LAG(logged_on) OVER (ORDER BY logged_on) AS gap_days
            FROM dated
        ),
        streak_groups AS (
            SELECT
                logged_on,
                SUM(CASE WHEN gap_days > 1 OR gap_days IS NULL THEN 1 ELSE 0 END)
                    OVER (ORDER BY logged_on) AS streak_id
            FROM gaps
        )
        SELECT
            MIN(logged_on) AS streak_start,
            MAX(logged_on) AS streak_end,
            COUNT(*)       AS days_in_streak
        FROM streak_groups
        GROUP BY streak_id
        ORDER BY streak_start DESC
        LIMIT 10
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()


@router.get("/week-over-week")
def week_over_week():
    """
    Weekly volume with percentage change vs. previous week.
    Uses LAG() window function in SQL.
    """
    sql = """
        WITH weekly AS (
            SELECT
                DATE_TRUNC('week', logged_on)::DATE AS week_start,
                SUM(sets * reps * weight_kg)        AS volume_kg
            FROM workouts
            GROUP BY DATE_TRUNC('week', logged_on)
        )
        SELECT
            week_start,
            volume_kg,
            LAG(volume_kg) OVER (ORDER BY week_start)              AS prev_week_volume,
            volume_kg - LAG(volume_kg) OVER (ORDER BY week_start)  AS volume_change,
            ROUND(
                100.0 * (volume_kg - LAG(volume_kg) OVER (ORDER BY week_start))
                / NULLIF(LAG(volume_kg) OVER (ORDER BY week_start), 0),
                1
            )                                                       AS pct_change
        FROM weekly
        ORDER BY week_start DESC
        LIMIT 12
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()
