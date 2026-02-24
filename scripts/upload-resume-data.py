#!/usr/bin/env python3
"""
Script to upload Prabhav Shrestha's resume data to PostgreSQL database.
Reads connection details from .env.local, ensures core schema exists,
and inserts the candidate resume content.

Usage: 
    python scripts/upload-resume-data.py
or
    python3 scripts/upload-resume-data.py
"""

import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

def load_env():
    """Load environment variables from .env.local"""
    env_path = Path(__file__).parent.parent / '.env.local'
    if not env_path.exists():
        print(f"❌ Error: .env.local not found at {env_path}")
        sys.exit(1)
    
    load_dotenv(env_path)
    print(f"✅ Loaded environment from: {env_path}")

def get_connection_string():
    """Get PostgreSQL connection string from environment"""
    conn_string = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL')
    
    if not conn_string:
        print("❌ Error: DATABASE_URL or POSTGRES_URL not found in .env.local")
        sys.exit(1)
    
    return conn_string

def read_schema_file():
    """Read the SQL schema file"""
    schema_path = Path(__file__).parent.parent / 'database' / 'schema.sql'
    
    if not schema_path.exists():
        print(f"❌ Error: schema.sql not found at {schema_path}")
        sys.exit(1)
    
    print(f"📄 Reading schema from: {schema_path}")
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"📊 Schema file size: {len(content) / 1024:.2f} KB\n")
    return content

def parse_sql_statements(sql_content):
    """Parse SQL content into individual statements"""
    # Remove single-line comments
    lines = []
    for line in sql_content.split('\n'):
        stripped = line.strip()
        if stripped and not stripped.startswith('--'):
            lines.append(line)
    
    # Join lines and split by semicolons
    content = '\n'.join(lines)
    statements = [stmt.strip() for stmt in content.split(';') if stmt.strip()]
    
    return statements


def ensure_schema(cur):
    """Create tables/indexes/views from schema.sql (skip seed INSERT data)."""
    sql_content = read_schema_file()
    statements = parse_sql_statements(sql_content)

    ddl_prefixes = (
        'CREATE TABLE',
        'CREATE INDEX',
        'CREATE OR REPLACE VIEW',
    )

    executed = 0
    skipped = 0

    print("🧱 Ensuring database schema objects exist...\n")

    for i, statement in enumerate(statements, 1):
        normalized = statement.strip().upper()
        if not normalized.startswith(ddl_prefixes):
            continue

        try:
            cur.execute(statement)
            executed += 1
        except psycopg2.Error as e:
            if e.pgcode in ('42P07', '42710'):
                skipped += 1
                continue

            print(f"\n❌ Error executing schema statement {i}:")
            print(f"   {e}")
            raise

    print(f"✅ Schema ready (executed: {executed}, skipped: {skipped})\n")


def get_or_create_skill_category(cur, category_name, display_order):
    """Get category id by name, creating it if needed."""
    cur.execute(
        """
        INSERT INTO skill_categories (category_name, display_order)
        VALUES (%s, %s)
        ON CONFLICT (category_name) DO NOTHING
        """,
        (category_name, display_order),
    )

    cur.execute(
        "SELECT id FROM skill_categories WHERE category_name = %s",
        (category_name,),
    )
    row = cur.fetchone()
    return row[0]


def insert_resume_data(cur):
    """Insert Prabhav Shrestha resume details into normalized tables."""
    print("📝 Inserting Prabhav Shrestha resume data...\n")

    profile = {
        'first_name': 'Prabhav',
        'last_name': 'Shrestha',
        'email': 'prabhavshrestha2005@gmail.com',
        'phone': '0470490977',
        'location': 'NSW, Australia',
        'career_objective': 'Build performant, user-centric web applications as a front-end developer with strong UI/UX quality and accessibility standards.',
        'professional_summary': (
            'Detail-oriented Front-End Developer with 2 years of experience building responsive, '
            'user-centric web applications. Proven track record of collaborating with cross-functional '
            'teams to deliver high-quality code using React.js, JavaScript, and modern CSS frameworks. '
            'Passionate about performance optimization, UI/UX consistency, and staying current with '
            'evolving web technologies.'
        ),
        'status': 'Available for opportunities',
        'current_position': 'Front-End Developer',
        'years_of_experience': 2,
    }

    cur.execute(
        "DELETE FROM candidate_profile WHERE email = %s",
        (profile['email'],),
    )

    cur.execute(
        """
        INSERT INTO candidate_profile (
            first_name,
            last_name,
            email,
            phone,
            location,
            career_objective,
            professional_summary,
            status,
            current_position,
            years_of_experience
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            profile['first_name'],
            profile['last_name'],
            profile['email'],
            profile['phone'],
            profile['location'],
            profile['career_objective'],
            profile['professional_summary'],
            profile['status'],
            profile['current_position'],
            profile['years_of_experience'],
        ),
    )
    candidate_id = cur.fetchone()[0]

    contact_entries = [
        ('email', profile['email'], True),
        ('phone', profile['phone'], True),
        ('location', profile['location'], True),
        ('github', 'prabhavshrestha', False),
    ]
    for contact_type, contact_value, is_primary in contact_entries:
        cur.execute(
            """
            INSERT INTO contact_info (candidate_id, contact_type, contact_value, is_primary)
            VALUES (%s, %s, %s, %s)
            """,
            (candidate_id, contact_type, contact_value, is_primary),
        )

    skills_by_category = [
        ('Languages', ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript']),
        ('Frameworks/Libraries', ['React.js', 'Redux', 'Tailwind CSS', 'Bootstrap', 'Next.js (Basics)']),
        ('Tools & Version Control', ['Git', 'GitHub', 'Vite', 'Webpack', 'npm/yarn']),
        ('Design & UI', ['Figma', 'Adobe XD', 'Responsive Design', 'Accessibility (WCAG)']),
        ('Back-End Familiarity', ['Node.js', 'RESTful APIs', 'Firebase']),
    ]

    for display_order, (category_name, category_skills) in enumerate(skills_by_category, start=1):
        category_id = get_or_create_skill_category(cur, category_name, display_order)
        for skill_name in category_skills:
            cur.execute(
                """
                INSERT INTO skills (candidate_id, category_id, skill_name)
                VALUES (%s, %s, %s)
                """,
                (candidate_id, category_id, skill_name),
            )

    competencies = [
        'Performance Optimization',
        'UI/UX Consistency',
        'Cross-functional Collaboration',
        'Responsive Development',
        'Accessibility Compliance',
    ]
    for competency in competencies:
        cur.execute(
            """
            INSERT INTO professional_competencies (candidate_id, competency_name)
            VALUES (%s, %s)
            """,
            (candidate_id, competency),
        )

    work_experiences = [
        {
            'job_title': 'Junior Front-End Developer',
            'company_name': 'TechFlow Solutions',
            'location': 'NSW, Australia',
            'start_date': '2024-01-01',
            'end_date': None,
            'is_current': True,
            'employment_type': 'Full-time',
            'description': 'Developed and maintained modern front-end experiences using React.js and Tailwind CSS.',
            'highlights': [
                'Developed and maintained 15+ responsive web pages using React.js and Tailwind CSS, improving mobile traffic retention by 20%.',
                'Collaborated with UI/UX designers to translate Figma wireframes into high-fidelity, interactive components.',
                'Optimized application performance by implementing lazy loading and code splitting, reducing initial load times by 1.5 seconds.',
                'Fixed over 50+ critical UI bugs, ensuring cross-browser compatibility across Chrome, Safari, and Firefox.',
                'Participated in daily Scrum meetings and contributed to sprint planning and code reviews to maintain high code standards.',
            ],
            'tags': ['React.js', 'Tailwind CSS', 'Performance', 'Scrum', 'Cross-Browser'],
        },
        {
            'job_title': 'Front-End Intern',
            'company_name': 'Creative Digital Agency',
            'location': 'NSW, Australia',
            'start_date': '2023-01-01',
            'end_date': '2023-12-31',
            'is_current': False,
            'employment_type': 'Internship',
            'description': 'Supported front-end development and testing for client-facing digital products.',
            'highlights': [
                'Assisted in the development of client landing pages using HTML, CSS, and vanilla JavaScript.',
                'Converted legacy CSS codebases to Sass (SCSS), improving stylesheet modularity and maintainability.',
                'Integrated RESTful APIs to display dynamic data, such as weather updates and live currency rates, on client dashboards.',
                'Performed comprehensive unit testing using Jest, ensuring stable deployments for monthly site updates.',
            ],
            'tags': ['HTML', 'CSS', 'JavaScript', 'SCSS', 'REST API', 'Jest'],
        },
    ]

    for experience in work_experiences:
        cur.execute(
            """
            INSERT INTO work_experience (
                candidate_id,
                job_title,
                company_name,
                location,
                start_date,
                end_date,
                is_current,
                employment_type,
                description
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                candidate_id,
                experience['job_title'],
                experience['company_name'],
                experience['location'],
                experience['start_date'],
                experience['end_date'],
                experience['is_current'],
                experience['employment_type'],
                experience['description'],
            ),
        )
        experience_id = cur.fetchone()[0]

        for display_order, highlight in enumerate(experience['highlights'], start=1):
            cur.execute(
                """
                INSERT INTO work_experience_highlights (
                    experience_id,
                    highlight_text,
                    display_order,
                    achievement_type
                )
                VALUES (%s, %s, %s, %s)
                """,
                (experience_id, highlight, display_order, 'technical'),
            )

        for tag in experience['tags']:
            cur.execute(
                """
                INSERT INTO work_experience_tags (experience_id, tag_name)
                VALUES (%s, %s)
                """,
                (experience_id, tag),
            )

    cur.execute(
        """
        INSERT INTO education (
            candidate_id,
            degree_type,
            degree_name,
            field_of_study,
            institution_name,
            location,
            end_date,
            graduation_year,
            is_current,
            description
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            candidate_id,
            'Bachelor',
            'Bachelor of Science',
            'Computer Science',
            'University Name',
            'Location',
            '2022-12-01',
            2022,
            False,
            'Graduated in December 2022.',
        ),
    )
    education_id = cur.fetchone()[0]

    education_coursework = [
        'Web Development',
        'Software Engineering',
        'Human-Computer Interaction',
        'Database Systems',
    ]
    for course in education_coursework:
        cur.execute(
            """
            INSERT INTO education_coursework (education_id, course_name)
            VALUES (%s, %s)
            """,
            (education_id, course),
        )

    projects = [
        {
            'title': 'E-Commerce Dashboard',
            'subtitle': 'React + Chart.js Analytics Dashboard',
            'description': 'Built a custom dashboard to visualize sales data and inventory levels with responsive navigation and theme switching.',
            'highlights': [
                'Built a custom dashboard using React and Chart.js to visualize sales data and inventory levels.',
                'Implemented a dark/light mode toggle and a fully responsive sidebar navigation.',
            ],
            'tags': ['React', 'Chart.js', 'Responsive UI', 'Dashboard'],
            'is_featured': True,
        },
        {
            'title': 'Personal Portfolio Website',
            'subtitle': 'Next.js + Framer Motion Portfolio',
            'description': 'Developed a high-performance portfolio site focused on SEO, accessibility, and smooth UI transitions.',
            'highlights': [
                'Developed a high-performance portfolio site using Next.js and Framer Motion for smooth scroll animations.',
                'Achieved a 100/100 Lighthouse score for SEO and Accessibility.',
            ],
            'tags': ['Next.js', 'Framer Motion', 'SEO', 'Accessibility'],
            'is_featured': True,
        },
    ]

    for project in projects:
        cur.execute(
            """
            INSERT INTO projects (
                candidate_id,
                project_title,
                project_subtitle,
                description,
                is_featured
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                candidate_id,
                project['title'],
                project['subtitle'],
                project['description'],
                project['is_featured'],
            ),
        )
        project_id = cur.fetchone()[0]

        for display_order, highlight in enumerate(project['highlights'], start=1):
            cur.execute(
                """
                INSERT INTO project_highlights (project_id, highlight_text, display_order)
                VALUES (%s, %s, %s)
                """,
                (project_id, highlight, display_order),
            )

        for tag in project['tags']:
            cur.execute(
                """
                INSERT INTO project_tags (project_id, tag_name)
                VALUES (%s, %s)
                """,
                (project_id, tag),
            )

    certifications = [
        ('Meta Front-End Developer Professional Certificate', 'Coursera'),
        ('Responsive Web Design Certification', 'freeCodeCamp'),
    ]
    for cert_name, issuer in certifications:
        cur.execute(
            """
            INSERT INTO certifications (candidate_id, certification_name, issuing_organization)
            VALUES (%s, %s, %s)
            """,
            (candidate_id, cert_name, issuer),
        )

    additional_info = [
        ('profile', 'role', 'Front-End Developer NSW'),
        ('profile', 'github_username', 'prabhavshrestha'),
    ]
    for category, key, value in additional_info:
        cur.execute(
            """
            INSERT INTO additional_info (candidate_id, info_category, info_key, info_value)
            VALUES (%s, %s, %s, %s)
            """,
            (candidate_id, category, key, value),
        )

    return candidate_id

def upload_resume_data():
    """Main function to upload resume data"""
    print("🚀 Starting Resume Data Upload\n")
    print("=" * 60)

    conn = None
    cur = None
    
    # Load environment
    load_env()
    
    # Get connection string
    conn_string = get_connection_string()
    
    # Connect to database
    try:
        print("🔌 Connecting to PostgreSQL database...")
        conn = psycopg2.connect(conn_string)
        conn.set_session(autocommit=False)
        cur = conn.cursor()
        
        print(f"✅ Connected successfully")
        print(f"📍 Database: {os.getenv('PGDATABASE', 'neondb')}")
        print(f"🖥️  Host: {os.getenv('PGHOST', 'unknown')}\n")
        
        ensure_schema(cur)
        candidate_id = insert_resume_data(cur)
        
        # Commit transaction
        conn.commit()
        print("\n✅ Transaction committed successfully!")
        print(f"📊 Summary:")
        print(f"   - Candidate profile inserted for: Prabhav Shrestha")
        print(f"   - Candidate ID: {candidate_id}")
        
        # Verify data
        print("\n🔍 Verifying uploaded data...")
        
        cur.execute(
            "SELECT id, first_name, last_name, email, current_position "
            "FROM candidate_profile WHERE id = %s",
            (candidate_id,)
        )
        candidate = cur.fetchone()
        
        if candidate:
            print(f"   ✓ Candidate: {candidate[1]} {candidate[2]}")
            print(f"   ✓ Email: {candidate[3]}")
            print(f"   ✓ Position: {candidate[4]}")
        
        cur.execute("SELECT COUNT(*) FROM skills WHERE candidate_id = %s", (candidate_id,))
        print(f"   ✓ Skills: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM work_experience WHERE candidate_id = %s", (candidate_id,))
        print(f"   ✓ Work Experience: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM projects WHERE candidate_id = %s", (candidate_id,))
        print(f"   ✓ Projects: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM education WHERE candidate_id = %s", (candidate_id,))
        print(f"   ✓ Education: {cur.fetchone()[0]}")

        cur.execute("SELECT COUNT(*) FROM certifications WHERE candidate_id = %s", (candidate_id,))
        print(f"   ✓ Certifications: {cur.fetchone()[0]}")
        
        print("\n🎉 Resume data uploaded successfully!\n")
        print("=" * 60)
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
            print("🔌 Database connection closed")

if __name__ == "__main__":
    upload_resume_data()
