import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, confirmation_id } = body;

    if (!user_id || user_id !== confirmation_id) {
      return NextResponse.json(
        { error: 'Confirmation ID does not match active User ID' },
        { status: 400 }
      );
    }

    const rows = await query('DELETE FROM workouts WHERE user_id = $1 RETURNING id', [user_id]);

    return NextResponse.json({
      success: true,
      deleted_count: rows.length,
      message: `Successfully cleared all ${rows.length} workout records for user #${user_id}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
