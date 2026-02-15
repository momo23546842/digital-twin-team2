/**
 * Resume Context for Digital Twin Assistant
 * Provides formatted resume information for AI assistant
 */

import resumeData from '../app/api/webhooks/vapi/resume.json';

/**
 * Formats resume data into a context string for the AI assistant
 * @returns Formatted resume context string
 */
export function getResumeContext(): string {
  const sections: string[] = [];

  // Name and Title
  sections.push(`Name: ${resumeData.name}`);
  if (resumeData.title) {
    sections.push(`Title: ${resumeData.title}`);
  }

  // Contact Information
  if (resumeData.contact) {
    const contactInfo = [
      `Location: ${resumeData.contact.location}`,
      `Phone: ${resumeData.contact.phone}`,
      `Email: ${resumeData.contact.email}`,
      resumeData.contact.linkedin && `LinkedIn: ${resumeData.contact.linkedin}`,
      resumeData.contact.github && `GitHub: ${resumeData.contact.github}`
    ].filter(Boolean);
    sections.push(`\nContact Information:\n${contactInfo.join('\n')}`);
  }

  // Professional Summary
  if (resumeData.professional_summary) {
    sections.push(`\nProfessional Summary:\n${resumeData.professional_summary}`);
  }

  // Technical Skills
  if (resumeData.technical_skills) {
    const skills = resumeData.technical_skills;
    const skillsText = [
      skills.languages && `Languages: ${skills.languages.join(', ')}`,
      skills.frameworks_libraries && `Frameworks & Libraries: ${skills.frameworks_libraries.join(', ')}`,
      skills.tools_version_control && `Tools & Version Control: ${skills.tools_version_control.join(', ')}`,
      skills.design_ui && `Design & UI: ${skills.design_ui.join(', ')}`,
      skills.backend_familiarity && `Backend Familiarity: ${skills.backend_familiarity.join(', ')}`
    ].filter(Boolean).join('\n');
    sections.push(`\nTechnical Skills:\n${skillsText}`);
  }

  // Professional Experience
  if (resumeData.professional_experience && resumeData.professional_experience.length > 0) {
    sections.push(`\nProfessional Experience:\n${resumeData.professional_experience.join('\n')}`);
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    sections.push(`\nEducation:\n${resumeData.education.join('\n')}`);
  }

  // Key Projects
  if (resumeData.key_projects && resumeData.key_projects.length > 0) {
    sections.push(`\nKey Projects:\n${resumeData.key_projects.join('\n')}`);
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    sections.push(`\nCertifications:\n${resumeData.certifications.join('\n')}`);
  }

  return sections.join('\n');
}
