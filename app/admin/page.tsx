import React from 'react';
import { getProfiles, getDashboard } from './actions';
import ProfileEditor from './components/ProfileEditor';
import SkillsManager from './components/SkillsManager';
import EducationManager from './components/EducationManager';
import ProjectsManager from './components/ProjectsManager';

export default async function AdminPage() {
  const profiles = await getProfiles();
  const dashboard = await getDashboard();

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="section-header">
        <h2 className="text-4xl font-extrabold text-gradient">Admin Dashboard</h2>
        <p className="text-slate-600">Manage candidate profiles, skills, education, and projects.</p>
      </div>

      {/* simple summary using counts from database */}
      {dashboard && (
        <div className="mt-6 mb-10 stats-grid">
          <div className="stat-item">
            <div className="stat-value">{dashboard.profiles}</div>
            <div className="stat-label">Profiles</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{dashboard.skills}</div>
            <div className="stat-label">Skills</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{dashboard.education}</div>
            <div className="stat-label">Educations</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{dashboard.projects}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
      )}

      {/* iterate profiles and show related managers so data reflects DB */}
      <div className="space-y-8">
        {profiles.map((p: any) => (
          <div key={p.id} className="card card-glow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{p.first_name} {p.last_name}</h3>
                <div className="text-slate-600">{p.email} • {p.location || '—'}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkillsManager candidateId={p.id} />
              <EducationManager candidateId={p.id} />
            </div>

            <div className="mt-6">
              <ProjectsManager candidateId={p.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
