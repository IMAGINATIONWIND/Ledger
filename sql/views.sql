-- ============================================================
--  IronLedger — SQL Views
--  These are pre-built queries stored in PostgreSQL.
--  The frontend always reads from these views, never raw tables.
-- ============================================================

-- ------------------------------------------------------------
-- VIEW 1: weekly_volume
-- Aggregates total training volume per week.
-- Volume = sets × reps × weight_kg  (a standard strength metric)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW weekly_volume AS
SELECT
    DATE_TRUNC('week', logged_on)::DATE          AS week_start,
    SUM(sets * reps * weight_kg)                 AS total_volume_kg,
    COUNT(DISTINCT logged_on)                    AS days_trained,
    COUNT(*)                                     AS total_sets
FROM workouts
GROUP BY DATE_TRUNC('week', logged_on)
ORDER BY week_start;


-- ------------------------------------------------------------
-- VIEW 2: monthly_volume
-- Same as above but grouped by calendar month.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW monthly_volume AS
SELECT
    DATE_TRUNC('month', logged_on)::DATE         AS month_start,
    TO_CHAR(logged_on, 'Mon YYYY')               AS month_label,
    SUM(sets * reps * weight_kg)                 AS total_volume_kg,
    COUNT(DISTINCT logged_on)                    AS days_trained,
    COUNT(*)                                     AS total_sets
FROM workouts
GROUP BY DATE_TRUNC('month', logged_on), TO_CHAR(logged_on, 'Mon YYYY')
ORDER BY month_start;


-- ------------------------------------------------------------
-- VIEW 3: personal_records
-- Uses a WINDOW FUNCTION to find the heaviest weight ever
-- lifted for each exercise — with the date it happened.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW personal_records AS
WITH ranked AS (
    SELECT
        exercise,
        weight_kg,
        logged_on,
        -- RANK window function: rank each row within the same exercise
        -- ordered by weight descending → rank 1 = heaviest ever
        RANK() OVER (
            PARTITION BY exercise
            ORDER BY weight_kg DESC, logged_on DESC
        ) AS rnk
    FROM workouts
)
SELECT
    exercise,
    weight_kg  AS pr_weight_kg,
    logged_on  AS pr_date
FROM ranked
WHERE rnk = 1;


-- ------------------------------------------------------------
-- VIEW 4: exercise_progression
-- Shows the MAX weight used per exercise per day.
-- Used to draw the "strength curve" line chart.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW exercise_progression AS
SELECT
    exercise,
    logged_on,
    MAX(weight_kg)                          AS max_weight_kg,
    SUM(sets * reps * weight_kg)            AS session_volume_kg
FROM workouts
GROUP BY exercise, logged_on
ORDER BY exercise, logged_on;


-- ------------------------------------------------------------
-- VIEW 5: category_breakdown
-- Volume split by training category (Push/Pull/Legs etc.)
-- Useful for the pie / donut chart on the dashboard.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW category_breakdown AS
SELECT
    category,
    SUM(sets * reps * weight_kg)            AS total_volume_kg,
    COUNT(*)                                AS total_sets,
    COUNT(DISTINCT logged_on)               AS sessions
FROM workouts
GROUP BY category
ORDER BY total_volume_kg DESC;


-- ------------------------------------------------------------
-- VIEW 6: recent_sessions
-- Last 10 training days — for the dashboard "recent activity" card.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW recent_sessions AS
SELECT
    logged_on,
    STRING_AGG(DISTINCT exercise, ', ' ORDER BY exercise)  AS exercises_done,
    COUNT(*)                                               AS total_sets,
    SUM(sets * reps * weight_kg)                           AS volume_kg
FROM workouts
GROUP BY logged_on
ORDER BY logged_on DESC
LIMIT 10;
