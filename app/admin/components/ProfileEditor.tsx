"use client";
import React, { useState } from 'react';

interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  location?: string;
  current_position?: string;
  years_of_experience?: number;
  status?: string;
}

export default function ProfileEditor({ profile, onDeleted, onUpdated }: { profile: Profile; onDeleted: (id: number) => void; onUpdated: (p: Profile) => void; }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>(profile);
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof Profile>(k: K, v: Profile[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdated(data.profile);
        setEditing(false);
      } else {
        console.error(data);
        alert('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this profile?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/profiles/${profile.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted(profile.id);
      } else {
        const d = await res.json();
        console.error(d);
        alert('Failed to delete');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 className="text-3xl">{profile.first_name} {profile.last_name}</h3>
          <p className="text-slate-600">{profile.email}</p>
        </div>
        <div className="space-x-4">
          <button className="btn btn-secondary" onClick={() => setEditing((s) => !s)}>{editing ? 'Cancel' : 'Edit'}</button>
          <button className="btn btn-ghost" onClick={remove} disabled={loading}>Delete</button>
        </div>
      </div>

      {editing && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input className="input" placeholder="First name" value={form.first_name || ''} onChange={(e) => setField('first_name', e.target.value)} />
            <input className="input" placeholder="Last name" value={form.last_name || ''} onChange={(e) => setField('last_name', e.target.value)} />
            <input className="input" placeholder="Email" value={form.email || ''} onChange={(e) => setField('email', e.target.value)} />
            <input className="input" placeholder="Phone" value={form.phone || ''} onChange={(e) => setField('phone', e.target.value)} />
            <input className="input" placeholder="Location" value={form.location || ''} onChange={(e) => setField('location', e.target.value)} />
            <input className="input" placeholder="Position" value={form.current_position || ''} onChange={(e) => setField('current_position', e.target.value)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={save} disabled={loading}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
