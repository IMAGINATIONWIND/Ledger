import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ exercise: string }> }
) {
  try {
    const { exercise } = await params;
    const decodedExercise = decodeURIComponent(exercise);

    const sql = `
      WITH daily_max AS (
        SELECT
          exercise,
          logged_on,
          MAX(weight_kg) AS max_weight_kg
        FROM workouts
        WHERE exercise = $1
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
    `;

    const rows = await query(sql, [decodedExercise]);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
