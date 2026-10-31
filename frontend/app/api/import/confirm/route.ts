import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length < headers.length) continue;
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    rows.push({
      logged_on: row.logged_on,
      exercise: row.exercise,
      category: row.category,
      sets: parseInt(row.sets, 10),
      reps: parseInt(row.reps, 10),
      weight_kg: parseFloat(row.weight_kg),
      notes: row.notes || null,
    });
  }
  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    let inserted = 0;
    for (const r of rows) {
      if (r.exercise && r.category && r.sets > 0 && r.reps > 0 && r.weight_kg >= 0) {
        await query(
          `INSERT INTO workouts (logged_on, exercise, category, sets, reps, weight_kg, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [r.logged_on, r.exercise, r.category, r.sets, r.reps, r.weight_kg, r.notes]
        );
        inserted++;
      }
    }

    return NextResponse.json({ inserted, message: 'Import successful' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
