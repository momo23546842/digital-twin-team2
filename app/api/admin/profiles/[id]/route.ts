import { NextResponse } from 'next/server';
import { pool } from '@/lib/candidate-db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const res = await pool.query(`SELECT * FROM candidate_profile WHERE id = $1`, [id]);
    if (!res.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ profile: res.rows[0] });
  } catch (err: any) {
    console.error('GET /api/admin/profiles/[id] error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const body = await req.json();
    const fields = Object.keys(body);
    if (!fields.length) return NextResponse.json({ error: 'no fields' }, { status: 400 });

    const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (body as any)[f]);
    values.push(id);

    const res = await pool.query(
      `UPDATE candidate_profile SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
      values,
    );

    return NextResponse.json({ profile: res.rows[0] });
  } catch (err: any) {
    console.error('PATCH /api/admin/profiles/[id] error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    await pool.query(`DELETE FROM candidate_profile WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE /api/admin/profiles/[id] error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
