import { NextResponse } from 'next/server';
import { pool } from '@/lib/candidate-db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const candidateId = url.searchParams.get('candidateId') || '1';
    const res = await pool.query(
      `SELECT id, candidate_id, skill_name, proficiency_level, years_of_experience FROM skills WHERE candidate_id = $1 ORDER BY skill_name ASC`,
      [Number(candidateId)],
    );
    return NextResponse.json({ skills: res.rows });
  } catch (err: any) {
    console.error('GET /api/admin/skills error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidate_id, skill_name, proficiency_level } = body;
    const res = await pool.query(
      `INSERT INTO skills (candidate_id, skill_name, proficiency_level) VALUES ($1, $2, $3) RETURNING *`,
      [candidate_id || 1, skill_name, proficiency_level || null],
    );
    return NextResponse.json({ skill: res.rows[0] }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/skills error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
