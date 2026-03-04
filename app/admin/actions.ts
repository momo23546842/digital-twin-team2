'use server';

import { revalidatePath } from 'next/cache';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Profiles Actions
export async function getProfiles() {
  const res = await fetch(`${BASE_URL}/api/admin/profiles`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.profiles || [];
}

// Profile Actions
export async function updateProfile(id: number, data: Record<string, any>) {
  const res = await fetch(`${BASE_URL}/api/admin/profiles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return result;
}

export async function deleteProfile(id: number) {
  const res = await fetch(`${BASE_URL}/api/admin/profiles/${id}`, {
    method: 'DELETE',
  });
  const result = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return result;
}

// Skills Actions
export async function getSkills(candidateId: number) {
  const res = await fetch(`${BASE_URL}/api/admin/skills?candidateId=${candidateId}`, {
    cache: 'no-store',
  });
  const data = await res.json();
  return data.skills || [];
}

export async function createSkill(
  candidateId: number,
  skillName: string,
  proficiencyLevel?: string
) {
  const res = await fetch(`${BASE_URL}/api/admin/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_id: candidateId,
      skill_name: skillName,
      proficiency_level: proficiencyLevel,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

export async function deleteSkill(id: number) {
  const res = await fetch(`${BASE_URL}/api/admin/skills/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

export async function updateSkill(id: number, skillName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/skills/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_name: skillName }),
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

// Education Actions
export async function getEducation(candidateId: number) {
  const res = await fetch(
    `${BASE_URL}/api/admin/education?candidateId=${candidateId}`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  return data.education || [];
}

export async function createEducation(
  candidateId: number,
  degreeType?: string,
  degreeName?: string,
  institutionName?: string
) {
  const res = await fetch(`${BASE_URL}/api/admin/education`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_id: candidateId,
      degree_type: degreeType,
      degree_name: degreeName,
      institution_name: institutionName,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

export async function deleteEducation(id: number) {
  const res = await fetch(`${BASE_URL}/api/admin/education/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

export async function updateEducation(id: number, degreeName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/education/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ degree_name: degreeName }),
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

// Projects Actions
export async function getProjects(candidateId: number) {
  const res = await fetch(
    `${BASE_URL}/api/admin/projects?candidateId=${candidateId}`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  return data.projects || [];
}

export async function createProject(
  candidateId: number,
  projectTitle: string,
  description?: string
) {
  const res = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_id: candidateId,
      project_title: projectTitle,
      description,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

export async function deleteProject(id: number) {
  const res = await fetch(`${BASE_URL}/api/admin/projects/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}

export async function updateProject(id: number, projectTitle: string) {
  const res = await fetch(`${BASE_URL}/api/admin/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_title: projectTitle }),
  });
  const data = await res.json();
  if (res.ok) {
    revalidatePath('/admin');
  }
  return data;
}
