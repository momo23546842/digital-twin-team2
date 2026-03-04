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
        <div className="mt-6 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <h4 className="font-semibold">Profiles</h4>
            <p className="text-2xl">{dashboard.profiles}</p>
          </div>
          <div className="card p-4">
            <h4 className="font-semibold">Skills</h4>
            <p className="text-2xl">{dashboard.skills}</p>
          </div>
          <div className="card p-4">
            <h4 className="font-semibold">Educations</h4>
            <p className="text-2xl">{dashboard.education}</p>
          </div>
          <div className="card p-4">
            <h4 className="font-semibold">Projects</h4>
            <p className="text-2xl">{dashboard.projects}</p>
          </div>
        </div>
      )}

      {/* iterate profiles and show related managers so data reflects DB */}
      <div className="space-y-12">
        {profiles.map((p: any) => (
          <div key={p.id} className="border rounded-lg p-6">
            <ProfileEditor
              profile={p}
              onDeleted={() => { /* nothing special */ }}
              onUpdated={() => { /* no-op */ }}
            />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
