import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '101';
    const exercise = searchParams.get('exercise');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    let sql = 'SELECT * FROM workouts WHERE user_id = $1';
    const params: any[] = [userId];

    if (exercise) {
      params.push(exercise);
      sql += ` AND exercise = $${params.length}`;
    }
    if (fromDate) {
      params.push(fromDate);
      sql += ` AND logged_on >= $${params.length}`;
    }
    if (toDate) {
      params.push(toDate);
      sql += ` AND logged_on <= $${params.length}`;
    }

    sql += ' ORDER BY logged_on DESC, id DESC';

    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, logged_on, exercise, category, sets, reps, weight_kg, notes } = body;
    const userId = user_id || '101';

    if (!exercise || !category || sets <= 0 || reps <= 0 || weight_kg < 0) {
      return NextResponse.json({ error: 'Invalid input fields' }, { status: 400 });
    }

    const sql = `
      INSERT INTO workouts (user_id, logged_on, exercise, category, sets, reps, weight_kg, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const rows = await query(sql, [
      userId,
      logged_on || new Date().toISOString().split('T')[0],
      exercise,
      category,
      sets,
      reps,
      weight_kg,
      notes || null,
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
