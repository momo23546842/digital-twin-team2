import Link from 'next/link';
import pg from 'pg';

const { Pool } = pg;

const globalForPortfolioPool = globalThis as typeof globalThis & {
  portfolioPool?: pg.Pool;
};

const pool =
  globalForPortfolioPool.portfolioPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPortfolioPool.portfolioPool = pool;
}

type PortfolioData = {
  profile: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    location: string | null;
    status: string | null;
    currentPosition: string | null;
    yearsOfExperience: number | null;
    objective: string | null;
    summary: string | null;
  } | null;
  contacts: Array<{ type: string; value: string; isPrimary: boolean }>;
  skills: Array<{ category: string; name: string; level: string | null }>;
  experience: Array<{
    id: number;
    jobTitle: string;
    companyName: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    highlights: string[];
  }>;
  projects: Array<{
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    projectUrl: string | null;
    repositoryUrl: string | null;
    isFeatured: boolean;
    tags: string[];
  }>;
  chat: {
    totalConversations: number;
    totalMessages: number;
    recentSessions: Array<{
      id: number;
      sessionId: string;
      recruiterName: string | null;
      companyName: string | null;
      jobTitle: string | null;
      startedAt: string;
      messageCount: number;
    }>;
  };
};

async function getPortfolioData(candidateId: number): Promise<PortfolioData> {
  const client = await pool.connect();

  try {
    const [profileResult, contactsResult, skillsResult, experienceResult, projectsResult, chatStatsResult, recentConversationsResult] =
      await Promise.all([
        client.query(
          `
          SELECT id, first_name, last_name, email, location, status,
                 current_position, years_of_experience,
                 career_objective, professional_summary
          FROM candidate_profile
          WHERE id = $1
          `,
          [candidateId],
        ),
        client.query(
          `
          SELECT contact_type, contact_value, is_primary
          FROM contact_info
          WHERE candidate_id = $1
          ORDER BY is_primary DESC, contact_type ASC
          `,
          [candidateId],
        ),
        client.query(
          `
          SELECT COALESCE(sc.category_name, 'General') AS category_name,
                 s.skill_name,
                 s.proficiency_level
          FROM skills s
          LEFT JOIN skill_categories sc ON s.category_id = sc.id
          WHERE s.candidate_id = $1
          ORDER BY sc.display_order NULLS LAST, s.skill_name ASC
          `,
          [candidateId],
        ),
        client.query(
          `
          SELECT
            we.id,
            we.job_title,
            we.company_name,
            we.location,
            we.start_date,
            we.end_date,
            we.is_current,
            we.description,
            COALESCE(
              json_agg(DISTINCT weh.highlight_text)
              FILTER (WHERE weh.id IS NOT NULL),
              '[]'::json
            ) AS highlights
          FROM work_experience we
          LEFT JOIN work_experience_highlights weh ON weh.experience_id = we.id
          WHERE we.candidate_id = $1
          GROUP BY we.id
          ORDER BY we.is_current DESC, we.start_date DESC
          LIMIT 6
          `,
          [candidateId],
        ),
        client.query(
          `
          SELECT
            p.id,
            p.project_title,
            p.project_subtitle,
            p.description,
            p.project_url,
            p.repository_url,
            p.is_featured,
            COALESCE(
              json_agg(DISTINCT pt.tag_name)
              FILTER (WHERE pt.id IS NOT NULL),
              '[]'::json
            ) AS tags
          FROM projects p
          LEFT JOIN project_tags pt ON pt.project_id = p.id
          WHERE p.candidate_id = $1
          GROUP BY p.id
          ORDER BY p.is_featured DESC, p.created_at DESC
          LIMIT 6
          `,
          [candidateId],
        ),
        client.query(
          `
          SELECT
            COUNT(DISTINCT c.id)::int AS total_conversations,
            COUNT(m.id)::int AS total_messages
          FROM conversations c
          LEFT JOIN messages m ON m.conversation_id = c.id
          WHERE c.candidate_id = $1
          `,
          [candidateId],
        ),
        client.query(
          `
          SELECT
            c.id,
            c.session_id,
            c.recruiter_name,
            c.company_name,
            c.job_title,
            c.started_at,
            COUNT(m.id)::int AS message_count
          FROM conversations c
          LEFT JOIN messages m ON m.conversation_id = c.id
          WHERE c.candidate_id = $1
          GROUP BY c.id
          ORDER BY c.started_at DESC
          LIMIT 5
          `,
          [candidateId],
        ),
      ]);

    const profileRow = profileResult.rows[0] ?? null;
    const chatStats = chatStatsResult.rows[0] ?? {
      total_conversations: 0,
      total_messages: 0,
    };

    return {
      profile: profileRow
        ? {
            id: profileRow.id,
            firstName: profileRow.first_name,
            lastName: profileRow.last_name,
            email: profileRow.email,
            location: profileRow.location,
            status: profileRow.status,
            currentPosition: profileRow.current_position,
            yearsOfExperience: profileRow.years_of_experience,
            objective: profileRow.career_objective,
            summary: profileRow.professional_summary,
          }
        : null,
      contacts: contactsResult.rows.map((row) => ({
        type: row.contact_type,
        value: row.contact_value,
        isPrimary: row.is_primary,
      })),
      skills: skillsResult.rows.map((row) => ({
        category: row.category_name,
        name: row.skill_name,
        level: row.proficiency_level,
      })),
      experience: experienceResult.rows.map((row) => ({
        id: row.id,
        jobTitle: row.job_title,
        companyName: row.company_name,
        location: row.location,
        startDate: new Date(row.start_date).toLocaleDateString(),
        endDate: row.end_date ? new Date(row.end_date).toLocaleDateString() : null,
        isCurrent: row.is_current,
        description: row.description,
        highlights: row.highlights ?? [],
      })),
      projects: projectsResult.rows.map((row) => ({
        id: row.id,
        title: row.project_title,
        subtitle: row.project_subtitle,
        description: row.description,
        projectUrl: row.project_url,
        repositoryUrl: row.repository_url,
        isFeatured: row.is_featured,
        tags: row.tags ?? [],
      })),
      chat: {
        totalConversations: chatStats.total_conversations,
        totalMessages: chatStats.total_messages,
        recentSessions: recentConversationsResult.rows.map((row) => ({
          id: row.id,
          sessionId: row.session_id,
          recruiterName: row.recruiter_name,
          companyName: row.company_name,
          jobTitle: row.job_title,
          startedAt: new Date(row.started_at).toLocaleDateString(),
          messageCount: row.message_count,
        })),
      },
    };
  } finally {
    client.release();
  }
}

export default async function Page() {
  const candidateId = 1;
  const portfolio = await getPortfolioData(candidateId);

  return (
    <div className="max-w-5xl mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      {!portfolio.profile ? (
        <section className="py-6">
          <h1 className="text-4xl font-extrabold">Professional Portfolio</h1>
          <p className="text-slate-600">No profile data found.</p>
        </section>
      ) : (
        <>
          <section className="py-6 border-b">
            <p className="text-slate-500" style={{ marginBottom: '0.35rem' }}>
              Professional Portfolio
            </p>
            <h1 className="text-4xl font-extrabold" style={{ marginTop: 0, marginBottom: '0.35rem' }}>
              {portfolio.profile.firstName} {portfolio.profile.lastName}
            </h1>
            <p className="text-lg" style={{ marginTop: 0, marginBottom: '0.35rem' }}>
              {portfolio.profile.currentPosition || 'Digital Twin Candidate'}
            </p>
            <p className="text-slate-600" style={{ marginTop: 0 }}>
              {portfolio.profile.location || 'Location not specified'}
              {portfolio.profile.status ? ` · ${portfolio.profile.status}` : ''}
            </p>
            {(portfolio.profile.summary || portfolio.profile.objective) && (
              <p className="text-slate-600" style={{ maxWidth: '46rem' }}>
                {portfolio.profile.summary || portfolio.profile.objective}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <p style={{ margin: 0 }}>
                <strong>{portfolio.profile.yearsOfExperience ?? 0}+</strong> years experience
              </p>
              <p style={{ margin: 0 }}>
                <strong>{portfolio.skills.length}</strong> skills
              </p>
              <p style={{ margin: 0 }}>
                <strong>{portfolio.projects.length}</strong> projects
              </p>
              <p style={{ margin: 0 }}>
                <strong>{portfolio.chat.totalConversations}</strong> chat sessions
              </p>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
              <Link href="/chat" style={{ textDecoration: 'underline' }}>
                Open AI chat
              </Link>
            </div>
          </section>

          <section className="py-6 border-b">
            <h2 style={{ marginTop: 0 }}>Contact</h2>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {portfolio.profile.email}
              </p>
              {portfolio.contacts.map((contact) => (
                <p key={`${contact.type}-${contact.value}`} style={{ margin: 0 }} className="text-slate-600">
                  <strong>{contact.type}:</strong> {contact.value}
                  {contact.isPrimary ? ' (primary)' : ''}
                </p>
              ))}
            </div>
          </section>

          <section className="py-6 border-b">
            <h2 style={{ marginTop: 0 }}>Skills & Expertise</h2>
            {portfolio.skills.length === 0 ? (
              <p className="text-slate-600">No skills found in database.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.2rem', columnCount: 2, columnGap: '2rem' }}>
                {portfolio.skills.map((skill) => (
                  <li key={`${skill.category}-${skill.name}`} style={{ breakInside: 'avoid', marginBottom: '0.4rem' }}>
                    {skill.name} <span className="text-slate-600">({skill.category}{skill.level ? ` · ${skill.level}` : ''})</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="py-6 border-b">
            <h2 style={{ marginTop: 0 }}>Experience</h2>
            {portfolio.experience.length === 0 ? (
              <p className="text-slate-600">No experience entries found in database.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1.1rem' }}>
                {portfolio.experience.map((item) => (
                  <article key={item.id}>
                    <p style={{ margin: 0 }}>
                      <strong>{item.jobTitle}</strong> · {item.companyName}
                    </p>
                    <p className="text-slate-600" style={{ marginTop: '0.2rem', marginBottom: '0.35rem' }}>
                      {item.startDate} - {item.isCurrent ? 'Present' : item.endDate || 'Present'}
                      {item.location ? ` · ${item.location}` : ''}
                    </p>
                    {item.description && <p className="text-slate-600" style={{ marginTop: 0 }}>{item.description}</p>}
                    {item.highlights.length > 0 && (
                      <ul style={{ marginTop: '0.25rem', paddingLeft: '1.2rem' }}>
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="py-6 border-b">
            <h2 style={{ marginTop: 0 }}>Featured Projects</h2>
            {portfolio.projects.length === 0 ? (
              <p className="text-slate-600">No projects found in database.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1.1rem' }}>
                {portfolio.projects.map((project) => (
                  <article key={project.id}>
                    <p style={{ margin: 0 }}>
                      <strong>{project.title}</strong>
                      {project.isFeatured ? ' · Featured' : ''}
                    </p>
                    {project.subtitle && (
                      <p className="text-slate-600" style={{ marginTop: '0.2rem', marginBottom: '0.35rem' }}>
                        {project.subtitle}
                      </p>
                    )}
                    {project.description && (
                      <p className="text-slate-600" style={{ marginTop: 0 }}>{project.description}</p>
                    )}
                    {project.tags.length > 0 && (
                      <p className="text-slate-600" style={{ marginTop: '0.3rem' }}>
                        Tech: {project.tags.join(', ')}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                          Live project
                        </a>
                      )}
                      {project.repositoryUrl && (
                        <a href={project.repositoryUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                          Repository
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="py-6">
            <h2 style={{ marginTop: 0 }}>Chat with My AI</h2>
            <p className="text-slate-600" style={{ marginTop: 0 }}>
              Based on stored conversation history from the digital twin database.
            </p>
            <p style={{ marginTop: 0 }}>
              <strong>{portfolio.chat.totalConversations}</strong> conversations ·{' '}
              <strong>{portfolio.chat.totalMessages}</strong> total messages
            </p>
            {portfolio.chat.recentSessions.length === 0 ? (
              <p className="text-slate-600">No recent chat sessions found.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {portfolio.chat.recentSessions.map((session) => (
                  <li key={session.id} style={{ marginBottom: '0.4rem' }}>
                    {session.startedAt} · Session {session.sessionId} · {session.messageCount} messages
                    {session.recruiterName ? ` · ${session.recruiterName}` : ''}
                    {session.companyName ? ` @ ${session.companyName}` : ''}
                    {session.jobTitle ? ` (${session.jobTitle})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
