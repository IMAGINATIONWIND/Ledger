import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query(`
      SELECT
        name,
        muscle_group,
        is_compound,
        COALESCE(primary_muscle, muscle_group) as primary_muscle,
        COALESCE(secondary_muscles, '') as secondary_muscles,
        COALESCE(anatomy_details, 'Key exercise for strengthening ' || muscle_group) as anatomy_details
      FROM exercises
      ORDER BY muscle_group, name
    `);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
