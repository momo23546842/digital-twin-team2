import React from 'react';
import ProfileEditor from './components/ProfileEditor';
import SkillsManager from './components/SkillsManager';
import EducationManager from './components/EducationManager';
import ProjectsManager from './components/ProjectsManager';

async function fetchProfiles() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/profiles`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.profiles || [];
}

export default async function AdminPage() {
  const profiles = await fetchProfiles();

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="section-header">
        <h2 className="text-4xl font-extrabold text-gradient">Admin Dashboard</h2>
        <p className="text-slate-600">Manage candidate profiles, skills, education, and projects.</p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {profiles.map((p: any) => (
            <ProfileEditor
              key={p.id}
              profile={p}
              onDeleted={() => { /* optimistic UI not required on server page */ }}
              onUpdated={() => { /* no-op */ }}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SkillsManager candidateId={1} />
          <EducationManager candidateId={1} />
        </div>

        <div>
          <ProjectsManager candidateId={1} />
        </div>
      </div>
    </div>
  );
}
