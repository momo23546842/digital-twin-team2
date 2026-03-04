import { NextResponse } from 'next/server';
import { pool } from '@/lib/candidate-db';

// returns simple counts for tables defined in our schema; helps admin get a quick overview
export async function GET() {
  try {
    const res = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM candidate_profile) AS profiles,
        (SELECT COUNT(*) FROM skills) AS skills,
        (SELECT COUNT(*) FROM education) AS education,
        (SELECT COUNT(*) FROM projects) AS projects
    `
    );

    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error('GET /api/admin/dashboard error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
