import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '101';

    const sql = `
      WITH weekly AS (
        SELECT
          user_id,
          DATE_TRUNC('week', logged_on)::DATE AS week_start,
          SUM(sets * reps * weight_kg)        AS volume_kg
        FROM workouts
        WHERE user_id = $1
        GROUP BY user_id, DATE_TRUNC('week', logged_on)
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
    `;
    const rows = await query(sql, [userId]);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
