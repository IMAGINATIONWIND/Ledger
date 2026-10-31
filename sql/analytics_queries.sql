-- ============================================================
--  IronLedger — Analytics Queries
--  PORTFOLIO SHOWCASE FILE
--
--  Each query is commented to explain:
--    WHY  — what business question it answers
--    HOW  — which SQL concept is being used
-- ============================================================


-- ============================================================
--  1. RUNNING TOTAL — Cumulative Volume Over Time
--  SQL Concept: Window function with SUM() OVER (ORDER BY ...)
-- ============================================================
-- WHY: Shows the user's cumulative effort from day one — a
--      satisfying "mountain you've climbed" line on the chart.
-- HOW: SUM() as a window function with ORDER BY creates a
--      running total without collapsing the rows like GROUP BY does.

SELECT
    logged_on,
    SUM(sets * reps * weight_kg)                         AS daily_volume_kg,
    SUM(SUM(sets * reps * weight_kg)) OVER (
        ORDER BY logged_on
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )                                                    AS cumulative_volume_kg
FROM workouts
GROUP BY logged_on
ORDER BY logged_on;


-- ============================================================
--  2. PERSONAL RECORDS WITH DATE — Window Function
--  SQL Concept: RANK() OVER (PARTITION BY ... ORDER BY ...)
-- ============================================================
-- WHY: The user wants to know their heaviest lift per exercise
--      AND the date they set it.
-- HOW: RANK() assigns a rank within each exercise partition
--      sorted by weight descending. Filtering WHERE rank = 1
--      gives the PR row without a subquery mess.

WITH ranked_lifts AS (
    SELECT
        exercise,
        weight_kg,
        logged_on,
        RANK() OVER (
            PARTITION BY exercise
            ORDER BY weight_kg DESC
        ) AS weight_rank
    FROM workouts
)
SELECT
    exercise,
    weight_kg  AS pr_kg,
    logged_on  AS pr_achieved_on
FROM ranked_lifts
WHERE weight_rank = 1
ORDER BY exercise;


-- ============================================================
--  3. WEEK-OVER-WEEK PROGRESS — LAG Window Function
--  SQL Concept: LAG() OVER (ORDER BY ...)
-- ============================================================
-- WHY: Did I train more this week than last week?
--      A simple but powerful motivation metric.
-- HOW: LAG() looks at the previous row's value in the ordered
--      result set. Subtracting gives the delta. No self-join needed.

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
    LAG(volume_kg) OVER (ORDER BY week_start)                         AS prev_week_volume,
    volume_kg - LAG(volume_kg) OVER (ORDER BY week_start)            AS volume_change,
    ROUND(
        100.0 * (volume_kg - LAG(volume_kg) OVER (ORDER BY week_start))
        / NULLIF(LAG(volume_kg) OVER (ORDER BY week_start), 0),
        1
    )                                                                  AS pct_change
FROM weekly
ORDER BY week_start;


-- ============================================================
--  4. EXERCISE FREQUENCY — How Often Each Lift is Trained
--  SQL Concept: GROUP BY + COUNT + ORDER BY
-- ============================================================
-- WHY: See if you're over-training one muscle group and
--      neglecting another.

SELECT
    exercise,
    category,
    COUNT(DISTINCT logged_on)                   AS days_trained,
    COUNT(*)                                    AS total_sets,
    SUM(sets * reps * weight_kg)                AS total_volume_kg,
    ROUND(AVG(weight_kg), 2)                    AS avg_weight_kg
FROM workouts
GROUP BY exercise, category
ORDER BY days_trained DESC, total_volume_kg DESC;


-- ============================================================
--  5. STRENGTH TREND PER EXERCISE — CTE + Aggregation
--  SQL Concept: Common Table Expression (WITH clause)
-- ============================================================
-- WHY: Chart the max weight used per exercise over time — the
--      core "am I getting stronger?" question.
-- HOW: CTE first aggregates per day, then the outer query
--      can be filtered by exercise name from the API.
--      Keeping logic in a CTE makes it readable and testable.

-- Replace 'Bench Press' with any exercise name from the API call
WITH daily_max AS (
    SELECT
        exercise,
        logged_on,
        MAX(weight_kg) AS max_weight_kg
    FROM workouts
    WHERE exercise = 'Bench Press'   -- parameterized at API level
    GROUP BY exercise, logged_on
)
SELECT
    logged_on,
    max_weight_kg,
    -- 7-day moving average to smooth out noise
    ROUND(
        AVG(max_weight_kg) OVER (
            ORDER BY logged_on
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ),
        2
    ) AS moving_avg_7d
FROM daily_max
ORDER BY logged_on;


-- ============================================================
--  6. TRAINING CONSISTENCY STREAK — Date Gaps
--  SQL Concept: LAG() + date arithmetic + CTE
-- ============================================================
-- WHY: "How many days in a row have I trained?"
--      Gamified streaks improve adherence.
-- HOW: LAG() gets the previous training date. If the gap is
--      exactly 1 day, we're still in a streak. GROUP BY on
--      a "streak_id" (changes when gap > 1) counts the streak.

WITH dated AS (
    SELECT DISTINCT logged_on FROM workouts ORDER BY logged_on
),
gaps AS (
    SELECT
        logged_on,
        LAG(logged_on) OVER (ORDER BY logged_on) AS prev_day,
        logged_on - LAG(logged_on) OVER (ORDER BY logged_on) AS gap_days
    FROM dated
),
streak_groups AS (
    SELECT
        logged_on,
        -- new streak begins when gap > 1 or it's the first row
        SUM(CASE WHEN gap_days > 1 OR gap_days IS NULL THEN 1 ELSE 0 END)
            OVER (ORDER BY logged_on) AS streak_id
    FROM gaps
)
SELECT
    streak_id,
    MIN(logged_on) AS streak_start,
    MAX(logged_on) AS streak_end,
    COUNT(*)       AS days_in_streak
FROM streak_groups
GROUP BY streak_id
ORDER BY streak_start DESC;


-- ============================================================
--  7. MUSCLE GROUP BALANCE — Volume Split
--  SQL Concept: GROUP BY + ROUND + CAST for percentages
-- ============================================================
-- WHY: Are you training push as much as pull? Legs enough?
--      A balanced program = fewer injuries.

WITH totals AS (
    SELECT SUM(sets * reps * weight_kg) AS grand_total FROM workouts
)
SELECT
    e.muscle_group,
    SUM(w.sets * w.reps * w.weight_kg)                         AS volume_kg,
    ROUND(
        100.0 * SUM(w.sets * w.reps * w.weight_kg)
        / (SELECT grand_total FROM totals),
        1
    )                                                           AS pct_of_total
FROM workouts w
JOIN exercises e ON w.exercise = e.name
GROUP BY e.muscle_group
ORDER BY volume_kg DESC;
