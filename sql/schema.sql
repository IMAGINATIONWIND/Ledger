-- ============================================================
--  IronLedger — Database Schema
--  PostgreSQL
-- ============================================================

-- Drop tables in safe order (for re-runs during development)
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;

-- ------------------------------------------------------------
-- exercises  (master / lookup table)
-- ------------------------------------------------------------
-- Stores the canonical list of exercises.
-- workouts.exercise references this to keep data consistent.
CREATE TABLE exercises (
    name          VARCHAR(100) PRIMARY KEY,
    muscle_group  VARCHAR(50)  NOT NULL,   -- e.g. Chest, Back, Legs, Core, Cardio
    is_compound   BOOLEAN      NOT NULL DEFAULT FALSE
    -- compound = multi-joint movement (squat, deadlift, bench)
    -- isolation  = single-joint (curl, lateral raise)
);

-- ------------------------------------------------------------
-- workouts  (main fact table — every set logged goes here)
-- ------------------------------------------------------------
CREATE TABLE workouts (
    id          SERIAL       PRIMARY KEY,
    logged_on   DATE         NOT NULL DEFAULT CURRENT_DATE,
    exercise    VARCHAR(100) NOT NULL REFERENCES exercises(name),
    category    VARCHAR(50)  NOT NULL,   -- Push / Pull / Legs / Cardio / Full Body
    sets        SMALLINT     NOT NULL CHECK (sets > 0),
    reps        SMALLINT     NOT NULL CHECK (reps > 0),
    weight_kg   NUMERIC(6,2) NOT NULL CHECK (weight_kg >= 0),
    -- weight_kg = 0 is valid for bodyweight exercises
    notes       TEXT
);

-- Indexes to speed up common filter + aggregation queries
CREATE INDEX idx_workouts_date     ON workouts (logged_on);
CREATE INDEX idx_workouts_exercise ON workouts (exercise);
CREATE INDEX idx_workouts_category ON workouts (category);

-- ============================================================
-- SEED DATA — starter exercises
-- ============================================================
INSERT INTO exercises (name, muscle_group, is_compound) VALUES
    -- Compound lifts
    ('Bench Press',        'Chest',     TRUE),
    ('Incline Bench Press','Chest',     TRUE),
    ('Squat',              'Legs',      TRUE),
    ('Deadlift',           'Back',      TRUE),
    ('Overhead Press',     'Shoulders', TRUE),
    ('Barbell Row',        'Back',      TRUE),
    ('Pull Up',            'Back',      TRUE),
    ('Dip',                'Chest',     TRUE),
    -- Isolation
    ('Bicep Curl',         'Arms',      FALSE),
    ('Tricep Pushdown',    'Arms',      FALSE),
    ('Lateral Raise',      'Shoulders', FALSE),
    ('Leg Press',          'Legs',      FALSE),
    ('Leg Curl',           'Legs',      FALSE),
    ('Calf Raise',         'Legs',      FALSE),
    ('Cable Fly',          'Chest',     FALSE),
    -- Cardio
    ('Running',            'Cardio',    FALSE),
    ('Cycling',            'Cardio',    FALSE),
    ('Jump Rope',          'Cardio',    FALSE);
