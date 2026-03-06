import { NextResponse } from 'next/server';
import { pool } from '@/lib/candidate-db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const candidateId = Number(url.searchParams.get('candidateId') || '1');
    const res = await pool.query(
      `SELECT id, project_title, project_subtitle, description, project_url, repository_url, is_featured FROM projects WHERE candidate_id = $1 ORDER BY created_at DESC`,
      [candidateId],
    );
    return NextResponse.json({ projects: res.rows });
  } catch (err: any) {
    console.error('GET /api/admin/projects error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidate_id, project_title, description } = body;
    const res = await pool.query(
      `INSERT INTO projects (candidate_id, project_title, description) VALUES ($1, $2, $3) RETURNING *`,
      [candidate_id || 1, project_title || 'New Project', description || null],
    );
    return NextResponse.json({ project: res.rows[0] }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/projects error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
