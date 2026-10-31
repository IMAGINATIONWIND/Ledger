import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sql = `
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
    `;
    const rows = await query(sql);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
