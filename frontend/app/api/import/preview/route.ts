import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json({
      total_rows: rows.length,
      preview: rows.slice(0, 20),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
