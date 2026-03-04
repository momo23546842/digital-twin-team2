import { NextResponse } from 'next/server';
import { pool } from '@/lib/candidate-db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const candidateId = Number(url.searchParams.get('candidateId') || '1');
    const res = await pool.query(
      `SELECT id, degree_type, degree_name, field_of_study, institution_name, start_date, end_date, is_current, graduation_year, gpa FROM education WHERE candidate_id = $1 ORDER BY end_date DESC NULLS LAST`,
      [candidateId],
    );
    return NextResponse.json({ education: res.rows });
  } catch (err: any) {
    console.error('GET /api/admin/education error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidate_id, degree_type, degree_name, institution_name, field_of_study } = body;
    const res = await pool.query(
      `INSERT INTO education (candidate_id, degree_type, degree_name, institution_name, field_of_study) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [candidate_id || 1, degree_type || null, degree_name || null, institution_name || null, field_of_study || null],
    );
    return NextResponse.json({ education: res.rows[0] }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/education error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
