import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await query('DELETE FROM workouts WHERE id = $1 RETURNING id', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
