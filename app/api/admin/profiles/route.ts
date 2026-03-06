import { NextResponse } from 'next/server';
import { pool } from '@/lib/candidate-db';

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT id, first_name, last_name, email, phone, location, current_position, years_of_experience, status FROM candidate_profile ORDER BY id ASC LIMIT 200`
    );
    return NextResponse.json({ profiles: res.rows });
  } catch (err: any) {
    console.error('GET /api/admin/profiles error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { first_name, last_name, email } = body;
    const result = await pool.query(
      `INSERT INTO candidate_profile (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *`,
      [first_name || 'New', last_name || 'Candidate', email || null]
    );
    return NextResponse.json({ profile: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/profiles error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
