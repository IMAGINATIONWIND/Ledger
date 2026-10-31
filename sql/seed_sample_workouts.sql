-- ============================================================
-- IronLedger — Sample Workout Data (for testing & demo)
-- ============================================================

INSERT INTO workouts (logged_on, exercise, category, sets, reps, weight_kg, notes) VALUES
    -- 4 weeks ago
    (CURRENT_DATE - INTERVAL '28 days', 'Bench Press', 'Push', 4, 8, 70.0, 'Working back into training'),
    (CURRENT_DATE - INTERVAL '28 days', 'Incline Bench Press', 'Push', 3, 10, 55.0, 'Moderate tempo'),
    (CURRENT_DATE - INTERVAL '27 days', 'Deadlift', 'Pull', 4, 5, 110.0, 'Conventional stance'),
    (CURRENT_DATE - INTERVAL '27 days', 'Barbell Row', 'Pull', 3, 8, 65.0, 'Strict form'),
    (CURRENT_DATE - INTERVAL '25 days', 'Squat', 'Legs', 4, 6, 90.0, 'Depth below parallel'),
    (CURRENT_DATE - INTERVAL '25 days', 'Leg Press', 'Legs', 3, 12, 160.0, 'Quad burner'),

    -- 3 weeks ago
    (CURRENT_DATE - INTERVAL '21 days', 'Bench Press', 'Push', 4, 8, 72.5, 'Smooth reps'),
    (CURRENT_DATE - INTERVAL '21 days', 'Overhead Press', 'Push', 3, 8, 45.0, 'Shoulder feeling strong'),
    (CURRENT_DATE - INTERVAL '20 days', 'Deadlift', 'Pull', 4, 5, 115.0, 'Good hook grip'),
    (CURRENT_DATE - INTERVAL '20 days', 'Pull Up', 'Pull', 4, 8, 0.0, 'Bodyweight pullups'),
    (CURRENT_DATE - INTERVAL '18 days', 'Squat', 'Legs', 4, 6, 95.0, 'Solid bar path'),

    -- 2 weeks ago
    (CURRENT_DATE - INTERVAL '14 days', 'Bench Press', 'Push', 4, 8, 75.0, 'Felt solid'),
    (CURRENT_DATE - INTERVAL '14 days', 'Incline Bench Press', 'Push', 3, 10, 60.0, 'Nice pump'),
    (CURRENT_DATE - INTERVAL '13 days', 'Deadlift', 'Pull', 4, 5, 120.0, 'New weight milestone'),
    (CURRENT_DATE - INTERVAL '13 days', 'Barbell Row', 'Pull', 3, 8, 70.0, 'Explosive drive'),
    (CURRENT_DATE - INTERVAL '11 days', 'Squat', 'Legs', 4, 6, 100.0, 'Triple digits!'),
    (CURRENT_DATE - INTERVAL '11 days', 'Leg Curl', 'Legs', 3, 12, 50.0, 'Hamstrings'),

    -- Last week
    (CURRENT_DATE - INTERVAL '7 days', 'Bench Press', 'Push', 4, 6, 77.5, 'Heavy week'),
    (CURRENT_DATE - INTERVAL '7 days', 'Dip', 'Push', 3, 10, 10.0, 'Weighted dips'),
    (CURRENT_DATE - INTERVAL '6 days', 'Deadlift', 'Pull', 3, 3, 125.0, 'PR attempt successful'),
    (CURRENT_DATE - INTERVAL '6 days', 'Pull Up', 'Pull', 4, 6, 10.0, 'Weighted pullups'),
    (CURRENT_DATE - INTERVAL '4 days', 'Squat', 'Legs', 4, 5, 105.0, 'Felt very stable'),

    -- Yesterday / Today
    (CURRENT_DATE - INTERVAL '1 day', 'Bench Press', 'Push', 3, 5, 80.0, '80kg reached!'),
    (CURRENT_DATE, 'Deadlift', 'Pull', 3, 3, 130.0, 'New 130kg PR');
