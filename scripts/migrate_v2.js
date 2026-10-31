const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8hYOwIvgV0En@ep-empty-rain-b8ywwzgc-pooler.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Neon PostgreSQL for v2 upgrade...');

  // 1. Add user_id to workouts
  await client.query(`
    ALTER TABLE workouts ADD COLUMN IF NOT EXISTS user_id VARCHAR(50) NOT NULL DEFAULT '101';
    CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts (user_id);
    CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts (user_id, logged_on);
  `);
  console.log('✓ Added user_id column and indexes to workouts');

  // 2. Add rich anatomical breakdown columns to exercises
  await client.query(`
    ALTER TABLE exercises ADD COLUMN IF NOT EXISTS primary_muscle VARCHAR(100);
    ALTER TABLE exercises ADD COLUMN IF NOT EXISTS secondary_muscles VARCHAR(200);
    ALTER TABLE exercises ADD COLUMN IF NOT EXISTS anatomy_details TEXT;
  `);
  console.log('✓ Added anatomy columns to exercises');

  // 3. Populate anatomy details for master exercises
  const updates = [
    {
      name: 'Bench Press',
      primary: 'Pectoralis Major (Sternal & Clavicular)',
      secondary: 'Anterior Deltoids, Triceps Brachii',
      details: 'Primary horizontal press. Stretches pec fibers at bottom; triceps and front deltoids assist lockout.'
    },
    {
      name: 'Incline Bench Press',
      primary: 'Upper Pectorals (Clavicular Head)',
      secondary: 'Anterior Deltoids, Triceps Brachii',
      details: 'Angle targets clavicular pec fibers and anterior delts, optimizing upper chest fullness.'
    },
    {
      name: 'Squat',
      primary: 'Quadriceps (Rectus Femoris, Vastus Lateralis/Medialis)',
      secondary: 'Gluteus Maximus, Hamstrings, Adductors, Spinal Erectors',
      details: 'Premier lower body compound lift. High knee flexion targets quads; hip extension activates glutes and adductors.'
    },
    {
      name: 'Deadlift',
      primary: 'Posterior Chain (Glutes, Hamstrings, Erector Spinae)',
      secondary: 'Latissimus Dorsi, Trapezius, Forearms (Grip), Core',
      details: 'Total body hip-hinge. Lat engagement keeps bar close while glutes and hamstrings drive hip extension.'
    },
    {
      name: 'Overhead Press',
      primary: 'Anterior & Lateral Deltoids',
      secondary: 'Triceps Brachii, Upper Pectorals, Serratus Anterior, Core',
      details: 'Vertical press demanding core stability and scapular upward rotation driven by the serratus anterior and deltoids.'
    },
    {
      name: 'Barbell Row',
      primary: 'Latissimus Dorsi, Rhomboids, Middle Trapezius',
      secondary: 'Posterior Deltoids, Biceps Brachii, Brachialis, Lower Back',
      details: 'Horizontal pull thickening mid-back. Scapular retraction targets rhomboids and mid-traps with high lat stretch.'
    },
    {
      name: 'Pull Up',
      primary: 'Latissimus Dorsi (Lats width)',
      secondary: 'Biceps Brachii, Brachialis, Teres Major, Lower Trapezius',
      details: 'Vertical pull that creates the V-taper. Shoulder adduction and depression strongly recruit the lats and teres major.'
    },
    {
      name: 'Dip',
      primary: 'Lower Pectorals & Triceps Brachii',
      secondary: 'Anterior Deltoids, Rhomboids',
      details: 'Forward torso lean shifts load to lower pectorals; upright posture emphasizes tricep extension strength.'
    },
    {
      name: 'Bicep Curl',
      primary: 'Biceps Brachii (Short & Long Heads)',
      secondary: 'Brachialis, Brachioradialis',
      details: 'Direct elbow flexion. Supinating forearm during movement maximizes peak contraction of the biceps brachii.'
    },
    {
      name: 'Tricep Pushdown',
      primary: 'Triceps Brachii (Lateral & Medial Heads)',
      secondary: 'Anconeus',
      details: 'Isolated elbow extension. Flare elbows minimally to focus tension directly on the lateral and medial heads.'
    },
    {
      name: 'Lateral Raise',
      primary: 'Lateral Deltoids (Shoulder Width)',
      secondary: 'Supraspinatus, Trapezius',
      details: 'Shoulder abduction in the scapular plane builds the 3D capped shoulder aesthetic.'
    },
    {
      name: 'Leg Press',
      primary: 'Quadriceps & Gluteus Maximus',
      secondary: 'Hamstrings, Calves',
      details: 'Removes axial spinal loading to allow high-volume quad and glute hypertrophy with foot placement versatility.'
    },
    {
      name: 'Leg Curl',
      primary: 'Hamstrings (Biceps Femoris, Semitendinosus)',
      secondary: 'Gastrocnemius',
      details: 'Pure knee flexion isolating all three hamstring heads without hip involvement.'
    },
    {
      name: 'Calf Raise',
      primary: 'Gastrocnemius & Soleus',
      secondary: 'Tibialis Posterior',
      details: 'Plantar flexion targeting the diamond head of the gastrocnemius (standing) and soleus (seated).'
    },
    {
      name: 'Cable Fly',
      primary: 'Pectoralis Major (Sternal Head)',
      secondary: 'Anterior Deltoids',
      details: 'Constant cable tension across the entire range of motion, delivering maximum adduction stretch and peak contraction.'
    }
  ];

  for (const ex of updates) {
    await client.query(`
      UPDATE exercises
      SET primary_muscle = $1, secondary_muscles = $2, anatomy_details = $3
      WHERE name = $4
    `, [ex.primary, ex.secondary, ex.details, ex.name]);
  }
  console.log('✓ Updated anatomy metadata for exercises');

  // 4. Update views with user_id (drop first to allow column reordering)
  await client.query(`
    DROP VIEW IF EXISTS weekly_volume CASCADE;
    DROP VIEW IF EXISTS monthly_volume CASCADE;
    DROP VIEW IF EXISTS personal_records CASCADE;
    DROP VIEW IF EXISTS category_breakdown CASCADE;
    DROP VIEW IF EXISTS recent_sessions CASCADE;

    CREATE VIEW weekly_volume AS
    SELECT
        user_id,
        DATE_TRUNC('week', logged_on)::DATE          AS week_start,
        SUM(sets * reps * weight_kg)                 AS total_volume_kg,
        COUNT(DISTINCT logged_on)                    AS days_trained,
        COUNT(*)                                     AS total_sets
    FROM workouts
    GROUP BY user_id, DATE_TRUNC('week', logged_on)
    ORDER BY week_start;

    CREATE OR REPLACE VIEW monthly_volume AS
    SELECT
        user_id,
        DATE_TRUNC('month', logged_on)::DATE         AS month_start,
        TO_CHAR(logged_on, 'Mon YYYY')               AS month_label,
        SUM(sets * reps * weight_kg)                 AS total_volume_kg,
        COUNT(DISTINCT logged_on)                    AS days_trained,
        COUNT(*)                                     AS total_sets
    FROM workouts
    GROUP BY user_id, DATE_TRUNC('month', logged_on), TO_CHAR(logged_on, 'Mon YYYY')
    ORDER BY month_start;

    CREATE OR REPLACE VIEW personal_records AS
    WITH ranked AS (
        SELECT
            user_id,
            exercise,
            weight_kg,
            logged_on,
            RANK() OVER (
                PARTITION BY user_id, exercise
                ORDER BY weight_kg DESC, logged_on DESC
            ) AS rnk
        FROM workouts
    )
    SELECT
        user_id,
        exercise,
        weight_kg  AS pr_weight_kg,
        logged_on  AS pr_date
    FROM ranked
    WHERE rnk = 1;

    CREATE OR REPLACE VIEW category_breakdown AS
    SELECT
        user_id,
        category,
        SUM(sets * reps * weight_kg)            AS total_volume_kg,
        COUNT(*)                                AS total_sets,
        COUNT(DISTINCT logged_on)               AS sessions
    FROM workouts
    GROUP BY user_id, category
    ORDER BY total_volume_kg DESC;

    CREATE OR REPLACE VIEW recent_sessions AS
    SELECT
        user_id,
        logged_on,
        STRING_AGG(DISTINCT exercise, ', ' ORDER BY exercise)  AS exercises_done,
        COUNT(*)                                               AS total_sets,
        SUM(sets * reps * weight_kg)                           AS volume_kg
    FROM workouts
    GROUP BY user_id, logged_on
    ORDER BY logged_on DESC;
  `);
  console.log('✓ Upgraded all SQL views with user_id partition');

  // 5. Seed a second demo user (user_id '102') so multi-profile switching is immediately verifiable!
  const user102Count = await client.query("SELECT COUNT(*) FROM workouts WHERE user_id = '102'");
  if (parseInt(user102Count.rows[0].count) === 0) {
    await client.query(`
      INSERT INTO workouts (user_id, logged_on, exercise, category, sets, reps, weight_kg, notes) VALUES
        ('102', CURRENT_DATE - INTERVAL '14 days', 'Incline Bench Press', 'Push', 4, 12, 65.0, 'Hypertrophy session'),
        ('102', CURRENT_DATE - INTERVAL '14 days', 'Cable Fly', 'Push', 4, 15, 25.0, 'Constant tension'),
        ('102', CURRENT_DATE - INTERVAL '14 days', 'Tricep Pushdown', 'Push', 4, 15, 35.0, 'Lockouts'),
        ('102', CURRENT_DATE - INTERVAL '12 days', 'Pull Up', 'Pull', 5, 10, 0.0, 'Bodyweight volume'),
        ('102', CURRENT_DATE - INTERVAL '12 days', 'Barbell Row', 'Pull', 4, 12, 75.0, 'Mind-muscle connection'),
        ('102', CURRENT_DATE - INTERVAL '12 days', 'Bicep Curl', 'Pull', 4, 12, 18.0, 'Strict curls'),
        ('102', CURRENT_DATE - INTERVAL '10 days', 'Squat', 'Legs', 4, 10, 110.0, 'Deep squats'),
        ('102', CURRENT_DATE - INTERVAL '10 days', 'Leg Press', 'Legs', 4, 15, 200.0, 'High volume quads'),
        ('102', CURRENT_DATE - INTERVAL '10 days', 'Calf Raise', 'Legs', 5, 20, 80.0, 'Calf burn'),
        ('102', CURRENT_DATE - INTERVAL '5 days', 'Incline Bench Press', 'Push', 4, 10, 70.0, 'Weight increase'),
        ('102', CURRENT_DATE - INTERVAL '5 days', 'Overhead Press', 'Push', 4, 10, 50.0, 'Standing strict press'),
        ('102', CURRENT_DATE - INTERVAL '3 days', 'Barbell Row', 'Pull', 4, 10, 80.0, 'Heavy rows'),
        ('102', CURRENT_DATE - INTERVAL '1 day', 'Squat', 'Legs', 4, 8, 120.0, 'New squat PR')
    `);
    console.log('✓ Seeded demo profile #102 with distinct workout history');
  }

  await client.end();
  console.log('Migration v2 complete!');
}

migrate().catch(err => {
  console.error('Migration v2 error:', err);
  process.exit(1);
});
