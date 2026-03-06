'use client';
import React, { useEffect, useState } from 'react';
import { getEducation, createEducation, deleteEducation, updateEducation } from '../actions';

interface Education { id: number; degree_type?: string; degree_name?: string; institution_name?: string }

export default function EducationManager({ candidateId = 1 }: { candidateId?: number }) {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ degree_type: '', degree_name: '', institution_name: '' });

  async function load() {
    setLoading(true);
    try {
      const d = await getEducation(candidateId);
      setItems(d);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [candidateId]);

  async function create() {
    if (!form.degree_name) return alert('Enter degree name');
    try {
      const d = await createEducation(candidateId, form.degree_type, form.degree_name, form.institution_name);
      if (d.education) { setItems((s) => [d.education, ...s]); setForm({ degree_type: '', degree_name: '', institution_name: '' }); }
      else alert('Failed to add');
    } catch (error) {
      console.error(error);
      alert('Failed to add');
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete education?')) return;
    try {
      await deleteEducation(id);
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    }
  }

  async function edit(id: number) {
    const name = prompt('Edit degree name', items.find((i) => i.id === id)?.degree_name || '');
    if (name == null) return;
    try {
      const d = await updateEducation(id, name);
      if (d.education) setItems((s) => s.map((x) => x.id === id ? d.education : x));
      else alert('Failed to update');
    } catch (error) {
      console.error(error);
      alert('Failed to update');
    }
  }

  return (
    <div className="card">
      <h3 className="text-3xl">Education</h3>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Degree type" value={form.degree_type} onChange={(e) => setForm({ ...form, degree_type: e.target.value })} />
          <input className="input" placeholder="Degree name" value={form.degree_name} onChange={(e) => setForm({ ...form, degree_name: e.target.value })} />
          <input className="input" placeholder="Institution" value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} />
          <button className="btn btn-primary" onClick={create}>Add</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{it.degree_name}</strong>
                  <div className="text-slate-600">{it.institution_name}</div>
                </div>
                <div className="space-x-4">
                  <button className="btn btn-secondary" onClick={() => edit(it.id)}>Edit</button>
                  <button className="btn btn-ghost" onClick={() => remove(it.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
