import resumeData from "@/data/resume.json";

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  skills: Record<string, string[]>;
  experience: Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduationDate: string;
    gpa: string;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  interests: string[];
}

/**
 * Returns the parsed resume data from the JSON file.
 */
export function getResume(): ResumeData {
  return resumeData as ResumeData;
}

/**
 * Builds a human-readable text summary of the entire resume.
 * Used as context for the AI system prompt.
 */
export function getResumeContext(): string {
  const r = getResume();
  const sections: string[] = [];

  // Header
  sections.push(
    `Name: ${r.name}`,
    `Title: ${r.title}`,
    `Location: ${r.location}`,
    `Email: ${r.email} | Phone: ${r.phone}`,
    `LinkedIn: ${r.linkedin} | GitHub: ${r.github} | Website: ${r.website}`,
  );

  // Summary
  sections.push(`\nProfessional Summary:\n${r.summary}`);

  // Skills
  const skillLines = Object.entries(r.skills)
    .map(([category, items]) => `  ${category}: ${items.join(", ")}`)
    .join("\n");
  sections.push(`\nSkills:\n${skillLines}`);

  // Experience
  const expLines = r.experience
    .map(
      (job) =>
        `  ${job.title} at ${job.company} (${job.startDate} – ${job.endDate}), ${job.location}\n` +
        job.highlights.map((h) => `    • ${h}`).join("\n")
    )
    .join("\n\n");
  sections.push(`\nWork Experience:\n${expLines}`);

  // Education
  const eduLines = r.education
    .map(
      (edu) =>
        `  ${edu.degree}, ${edu.institution} (Graduated ${edu.graduationDate}, GPA: ${edu.gpa})\n` +
        edu.highlights.map((h) => `    • ${h}`).join("\n")
    )
    .join("\n");
  sections.push(`\nEducation:\n${eduLines}`);

  // Projects
  const projLines = r.projects
    .map(
      (p) =>
        `  ${p.name}: ${p.description}\n    Technologies: ${p.technologies.join(", ")}\n    URL: ${p.url}`
    )
    .join("\n\n");
  sections.push(`\nProjects:\n${projLines}`);

  // Certifications
  const certLines = r.certifications
    .map((c) => `  ${c.name} – ${c.issuer} (${c.date})`)
    .join("\n");
  sections.push(`\nCertifications:\n${certLines}`);

  // Interests
  sections.push(`\nInterests: ${r.interests.join(", ")}`);

  return sections.join("\n");
}

/**
 * Returns a flat list of all skill keywords from the resume.
 */
export function getResumeSkills(): string[] {
  const r = getResume();
  return Object.values(r.skills).flat();
}
