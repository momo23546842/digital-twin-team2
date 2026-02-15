import { NextRequest, NextResponse } from "next/server";
import resumeData from "../webhooks/vapi/resume.json";

/**
 * Get resume data
 */
function loadResumeData() {
  return resumeData;
}

/**
 * Add CORS headers for Vapi
 */
function addCorsHeaders(response: Response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

/**
 * Handle OPTIONS preflight requests
 */
export async function OPTIONS(req: NextRequest) {
  const response = NextResponse.json({}, { status: 200 });
  return addCorsHeaders(response);
}

/**
 * Search resume for relevant information based on query
 */
function searchResume(resume: any, query: string): string {
  const lowerQuery = query.toLowerCase();
  const sections: string[] = [];

  // Keywords to section mapping
  const keywords = {
    name: ['name', 'who', 'person'],
    contact: ['contact', 'email', 'phone', 'location', 'reach', 'linkedin', 'github'],
    summary: ['summary', 'about', 'who', 'overview', 'introduction', 'background'],
    skills: ['skill', 'technology', 'tech', 'language', 'framework', 'tool', 'proficient', 'know'],
    experience: ['experience', 'work', 'job', 'employment', 'career', 'worked', 'position'],
    education: ['education', 'degree', 'university', 'college', 'study', 'studied', 'school'],
    projects: ['project', 'built', 'created', 'developed'],
    certifications: ['certification', 'certified', 'certificate', 'credential']
  };

  // Check if query matches any keyword categories
  const matchedSections = new Set<string>();
  for (const [section, words] of Object.entries(keywords)) {
    if (words.some(word => lowerQuery.includes(word))) {
      matchedSections.add(section);
    }
  }

  // If no specific section matched, return everything
  if (matchedSections.size === 0) {
    matchedSections.add('name');
    matchedSections.add('summary');
    matchedSections.add('skills');
    matchedSections.add('experience');
  }

  // Build response based on matched sections
  if (matchedSections.has('name')) {
    sections.push(`Name: ${resume.name}`);
    if (resume.title) sections.push(`Title: ${resume.title}`);
  }

  if (matchedSections.has('contact') && resume.contact) {
    const contactInfo = [
      `Location: ${resume.contact.location}`,
      `Phone: ${resume.contact.phone}`,
      `Email: ${resume.contact.email}`,
      resume.contact.linkedin && `LinkedIn: ${resume.contact.linkedin}`,
      resume.contact.github && `GitHub: ${resume.contact.github}`
    ].filter(Boolean);
    sections.push(`Contact Information:\n${contactInfo.join('\n')}`);
  }

  if (matchedSections.has('summary') && resume.professional_summary) {
    sections.push(`Professional Summary:\n${resume.professional_summary}`);
  }

  if (matchedSections.has('skills') && resume.technical_skills) {
    const skills = resume.technical_skills;
    const skillsText = [
      skills.languages && `Languages: ${skills.languages.join(', ')}`,
      skills.frameworks_libraries && `Frameworks & Libraries: ${skills.frameworks_libraries.join(', ')}`,
      skills.tools_version_control && `Tools & Version Control: ${skills.tools_version_control.join(', ')}`,
      skills.design_ui && `Design & UI: ${skills.design_ui.join(', ')}`,
      skills.backend_familiarity && `Backend Familiarity: ${skills.backend_familiarity.join(', ')}`
    ].filter(Boolean).join('\n');
    sections.push(`Technical Skills:\n${skillsText}`);
  }

  if (matchedSections.has('experience') && resume.professional_experience) {
    sections.push(`Professional Experience:\n${resume.professional_experience.join('\n')}`);
  }

  if (matchedSections.has('education') && resume.education) {
    sections.push(`Education:\n${resume.education.join('\n')}`);
  }

  if (matchedSections.has('projects') && resume.key_projects) {
    sections.push(`Key Projects:\n${resume.key_projects.join('\n')}`);
  }

  if (matchedSections.has('certifications') && resume.certifications) {
    sections.push(`Certifications:\n${resume.certifications.join('\n')}`);
  }

  return sections.join('\n\n');
}

/**
 * GET /api/context
 * Retrieve context from resume.json based on a query
 * This is called by Vapi assistant to access resume information
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('q') || '';

    console.log('[context-api] GET request received');
    console.log('[context-api] POST Query:', query);

    if (!query) {
      const response = new NextResponse('Error: Query parameter is required', { status: 400 });
      return addCorsHeaders(response);
    }

    // Load resume data
    const resume = loadResumeData();
    
    // Search for relevant information
    const context = searchResume(resume, query);

    console.log('[context-api] Returning context:', context.substring(0, 100));

    // Vapi expects plain text response, not JSON
    const response = new NextResponse(context, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('[context-api] GET Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response = new NextResponse(
      `Error: ${errorMessage}`,
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

/**
 * POST /api/context
 * Same as GET but accepts JSON body
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[context-api] POST request received');
    console.log('[context-api] Body:', JSON.stringify(body, null, 2));

    // Vapi sends the query nested in message.toolCalls[0].function.arguments.query
    let query = '';
    
    if (body.message?.toolCalls?.[0]?.function?.arguments?.query) {
      query = body.message.toolCalls[0].function.arguments.query;
    } else if (body.query) {
      query = body.query;
    }

    if (!query) {
      console.error('[context-api] No query found in request body');
      const response = new NextResponse(
        `Error: Query parameter is required`,
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('[context-api] Query:', query);

    // Load resume data
    const resume = loadResumeData();
    
    // Search for relevant information
    const context = searchResume(resume, query);

    console.log('[context-api] Returning context:', context.substring(0, 100));

    // Vapi expects plain text response, not JSON
    const response = new NextResponse(context, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('[context-api] POST Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response = new NextResponse(
      `Error: ${errorMessage}`,
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
