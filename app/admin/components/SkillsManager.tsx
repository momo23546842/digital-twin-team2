"use client";
import React, { useEffect, useState } from 'react';

interface Skill { id: number; candidate_id: number; skill_name: string; proficiency_level?: string; years_of_experience?: number }

export default function SkillsManager({ candidateId = 1 }: { candidateId?: number }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ skill_name: '', proficiency_level: '' });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/skills?candidateId=${candidateId}`);
      const data = await res.json();
      setSkills(data.skills || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [candidateId]);

  async function create() {
    if (!form.skill_name) return alert('Enter skill name');
    const res = await fetch('/api/admin/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_id: candidateId, ...form }) });
    const d = await res.json();
    if (res.ok) { setSkills((s) => [d.skill, ...s]); setForm({ skill_name: '', proficiency_level: '' }); }
    else alert('Failed to add');
  }

  async function remove(id: number) {
    if (!confirm('Delete skill?')) return;
    const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
    if (res.ok) setSkills((s) => s.filter((x) => x.id !== id));
    else alert('Failed to delete');
  }

  async function toggleEdit(id: number) {
    const name = prompt('Edit skill name', skills.find((s) => s.id === id)?.skill_name || '');
    if (name == null) return;
    const res = await fetch(`/api/admin/skills/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skill_name: name }) });
    const d = await res.json();
    if (res.ok) setSkills((s) => s.map((x) => x.id === id ? d.skill : x));
    else alert('Failed to update');
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-3xl">Skills</h3>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Skill name" value={form.skill_name} onChange={(e) => setForm({ ...form, skill_name: e.target.value })} />
          <input className="input" placeholder="Proficiency" value={form.proficiency_level} onChange={(e) => setForm({ ...form, proficiency_level: e.target.value })} />
          <button className="btn btn-primary" onClick={create}>Add</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div style={{ display: 'grid', gap: 8 }}>
            {skills.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{s.skill_name}</strong>
                  <div className="text-slate-600">{s.proficiency_level}</div>
                </div>
                <div className="space-x-4">
                  <button className="btn btn-secondary" onClick={() => toggleEdit(s.id)}>Edit</button>
                  <button className="btn btn-ghost" onClick={() => remove(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
