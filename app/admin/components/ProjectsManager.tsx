"use client";
import React, { useEffect, useState } from 'react';

interface Project { id: number; project_title: string; project_subtitle?: string; description?: string }

export default function ProjectsManager({ candidateId = 1 }: { candidateId?: number }) {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ project_title: '', description: '' });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects?candidateId=${candidateId}`);
      const d = await res.json();
      setItems(d.projects || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [candidateId]);

  async function create() {
    if (!form.project_title) return alert('Enter project title');
    const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_id: candidateId, ...form }) });
    const d = await res.json();
    if (res.ok) { setItems((s) => [d.project, ...s]); setForm({ project_title: '', description: '' }); }
    else alert('Failed to add');
  }

  async function remove(id: number) {
    if (!confirm('Delete project?')) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    if (res.ok) setItems((s) => s.filter((x) => x.id !== id));
    else alert('Failed to delete');
  }

  async function edit(id: number) {
    const title = prompt('Edit title', items.find((i) => i.id === id)?.project_title || '');
    if (title == null) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_title: title }) });
    const d = await res.json();
    if (res.ok) setItems((s) => s.map((x) => x.id === id ? d.project : x));
    else alert('Failed to update');
  }

  return (
    <div className="card">
      <h3 className="text-3xl">Projects</h3>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Project title" value={form.project_title} onChange={(e) => setForm({ ...form, project_title: e.target.value })} />
          <input className="input" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary" onClick={create}>Add</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{it.project_title}</strong>
                  <div className="text-slate-600">{it.project_subtitle || it.description}</div>
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
