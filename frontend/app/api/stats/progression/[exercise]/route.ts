import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exercise: string }> }
) {
  try {
    const { exercise } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '101';
    const decodedExercise = decodeURIComponent(exercise);

    const sql = `
      WITH daily_max AS (
        SELECT
          user_id,
          exercise,
          logged_on,
          MAX(weight_kg) AS max_weight_kg,
          SUM(sets * reps * weight_kg) AS session_volume_kg
        FROM workouts
        WHERE user_id = $1 AND exercise = $2
        GROUP BY user_id, exercise, logged_on
      )
      SELECT
        logged_on,
        max_weight_kg,
        session_volume_kg,
        ROUND(
          AVG(max_weight_kg) OVER (
            ORDER BY logged_on
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
          ),
          2
        ) AS moving_avg_7d
      FROM daily_max
      ORDER BY logged_on
    `;

    const rows = await query(sql, [userId, decodedExercise]);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
