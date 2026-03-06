'use client';
import React, { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject, updateProject } from '../actions';

interface Project { id: number; project_title: string; project_subtitle?: string; description?: string }

export default function ProjectsManager({ candidateId = 1 }: { candidateId?: number }) {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ project_title: '', description: '' });

  async function load() {
    setLoading(true);
    try {
      const d = await getProjects(candidateId);
      setItems(d);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [candidateId]);

  async function create() {
    if (!form.project_title) return alert('Enter project title');
    try {
      const d = await createProject(candidateId, form.project_title, form.description);
      if (d.project) { setItems((s) => [d.project, ...s]); setForm({ project_title: '', description: '' }); }
      else alert('Failed to add');
    } catch (error) {
      console.error(error);
      alert('Failed to add');
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete project?')) return;
    try {
      await deleteProject(id);
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    }
  }

  async function edit(id: number) {
    const title = prompt('Edit title', items.find((i) => i.id === id)?.project_title || '');
    if (title == null) return;
    try {
      const d = await updateProject(id, title);
      if (d.project) setItems((s) => s.map((x) => x.id === id ? d.project : x));
      else alert('Failed to update');
    } catch (error) {
      console.error(error);
      alert('Failed to update');
    }
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
