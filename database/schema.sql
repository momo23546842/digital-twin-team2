-- ============================================
-- Digital Twin Database Schema
-- Based on Rohan Sharma's Resume/CV
-- ============================================

-- ============================================
-- 1. PROFILE/CANDIDATE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS candidate_profile (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    career_objective TEXT,
    professional_summary TEXT,
    status VARCHAR(100), -- e.g., "Available for opportunities"
    current_position VARCHAR(255),
    years_of_experience INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CONTACT INFORMATION
-- ============================================
CREATE TABLE IF NOT EXISTS contact_info (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'location', 'linkedin', 'github'
    contact_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. SKILLS & COMPETENCIES
-- ============================================
CREATE TABLE IF NOT EXISTS skill_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES skill_categories(id) ON DELETE SET NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50), -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    years_of_experience DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professional_competencies (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    competency_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. WORK EXPERIENCE
-- ============================================
CREATE TABLE IF NOT EXISTS work_experience (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL if current position
    is_current BOOLEAN DEFAULT false,
    employment_type VARCHAR(50), -- 'Full-time', 'Part-time', 'Contract', 'Freelance'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_experience_highlights (
    id SERIAL PRIMARY KEY,
    experience_id INTEGER REFERENCES work_experience(id) ON DELETE CASCADE,
    highlight_text TEXT NOT NULL,
    display_order INTEGER,
    achievement_type VARCHAR(50), -- 'quantitative', 'qualitative', 'technical'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_experience_tags (
    id SERIAL PRIMARY KEY,
    experience_id INTEGER REFERENCES work_experience(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. EDUCATION
-- ============================================
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    degree_type VARCHAR(100) NOT NULL, -- 'Bachelor', 'Master', 'PhD', 'Certificate'
    degree_name VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    institution_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    graduation_year INTEGER,
    is_current BOOLEAN DEFAULT false,
    gpa VARCHAR(20),
    gpa_scale VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_coursework (
    id SERIAL PRIMARY KEY,
    education_id INTEGER REFERENCES education(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. CERTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    credential_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    project_title VARCHAR(255) NOT NULL,
    project_subtitle VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    project_url VARCHAR(500),
    repository_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_tags (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_highlights (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    highlight_text TEXT NOT NULL,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. ADDITIONAL INFORMATION
-- ============================================
CREATE TABLE IF NOT EXISTS additional_info (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    info_category VARCHAR(100) NOT NULL, -- 'visa_status', 'relocation', 'interests', 'languages'
    info_key VARCHAR(100) NOT NULL,
    info_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. CHAT/CONVERSATION HISTORY (for Digital Twin)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    recruiter_name VARCHAR(255),
    recruiter_email VARCHAR(255),
    job_title VARCHAR(255),
    company_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- for storing additional context like tool calls, embeddings, etc.
);

-- ============================================
-- 10. JOB MATCHING & ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS job_matches (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT,
    company_name VARCHAR(255),
    match_score DECIMAL(5,2), -- 0-100
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    matched_skills TEXT[], -- Array of matched skills
    skill_gaps TEXT[], -- Array of missing skills
    strengths TEXT,
    recommendations TEXT
);

-- ============================================
-- 11. VECTOR EMBEDDINGS (for RAG)
-- ============================================
-- Note: Using FLOAT[] for embeddings. For production with pgvector extension, use VECTOR type
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidate_profile(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- 'profile', 'experience', 'project', 'skill', 'education'
    source_id INTEGER, -- ID of the source record
    content TEXT NOT NULL,
    embedding_vector FLOAT[], -- Array of floats for embeddings (use VECTOR(1536) with pgvector extension)
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: To use pgvector extension for optimized vector operations:
-- CREATE EXTENSION IF NOT EXISTS vector;
-- Then change embedding_vector column type to: VECTOR(1536)

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_candidate_email ON candidate_profile(email);
CREATE INDEX idx_skills_candidate ON skills(candidate_id);
CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_experience_candidate ON work_experience(candidate_id);
CREATE INDEX idx_education_candidate ON education(candidate_id);
CREATE INDEX idx_projects_candidate ON projects(candidate_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_conversations_candidate ON conversations(candidate_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_job_matches_candidate ON job_matches(candidate_id);
CREATE INDEX idx_embeddings_candidate ON embeddings(candidate_id);
CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);

-- ============================================
-- SAMPLE DATA: Rohan Sharma's Profile
-- ============================================

-- Insert candidate profile
INSERT INTO candidate_profile (
    first_name, last_name, email, phone, location,
    career_objective, professional_summary, status,
    current_position, years_of_experience
) VALUES (
    'Rohan', 'Sharma', 'rohan.sha1989@gmail.com', '0403 896 266', 'Sydney, NSW, Australia',
    'Aspiring to contribute as an Engineering Technologist under Engineers Australia''s assessment pathway, leveraging strong analytical, technical, and problem-solving abilities. Committed to supporting the development of innovative, efficient, and sustainable engineering solutions while aligning with Australia''s professional standards and industry growth.',
    'Results-driven technologist and analyst with 5+ years of experience in engineering processes, automation testing, algorithmic trading systems, and data-driven decision making. Adept at applying system design principles and integrating technology with business objectives to enhance operational performance. Recognized for cross-functional collaboration, analytical rigor, and continuous improvement mindset. Currently pursuing a postgraduate qualification in Enterprise Resource Planning (ERP) at Victoria University Sydney to strengthen technical and managerial expertise for global engineering projects.',
    'Available for opportunities',
    'Derivative Analyst / Algo Trading Developer',
    5
);

-- Insert skill categories
INSERT INTO skill_categories (category_name, display_order) VALUES
    ('Programming & Development', 1),
    ('Automation & Testing', 2),
    ('Engineering Systems & ERP', 3),
    ('Analytics & Machine Learning', 4),
    ('Tools & Frameworks', 5);

-- Insert skills
INSERT INTO skills (candidate_id, category_id, skill_name) VALUES
    (1, 1, 'Python'),
    (1, 1, 'Core Java'),
    (1, 1, 'C'),
    (1, 1, 'Apache POI'),
    (1, 1, 'Maven'),
    (1, 2, 'Selenium WebDriver'),
    (1, 2, 'TestNG'),
    (1, 2, 'Cucumber'),
    (1, 2, 'Jenkins'),
    (1, 2, 'Git'),
    (1, 2, 'Page Object Model'),
    (1, 3, 'SAP ERP Modules'),
    (1, 3, 'Data Integration'),
    (1, 3, 'Reporting Automation'),
    (1, 4, 'Data Modelling'),
    (1, 4, 'Backtesting'),
    (1, 4, 'Risk Analytics'),
    (1, 4, 'Algorithmic Trading'),
    (1, 5, 'JIRA'),
    (1, 5, 'ServiceNow'),
    (1, 5, 'Cloud ITIL'),
    (1, 5, 'MATLAB'),
    (1, 5, 'MS Excel (Advanced)');

-- Insert professional competencies
INSERT INTO professional_competencies (candidate_id, competency_name) VALUES
    (1, 'Communication'),
    (1, 'Analytical Thinking'),
    (1, 'Problem Solving'),
    (1, 'Risk Management'),
    (1, 'Project Coordination'),
    (1, 'Cross-functional Collaboration');

-- Insert work experience
INSERT INTO work_experience (candidate_id, job_title, company_name, location, start_date, end_date, is_current) VALUES
    (1, 'Derivative Analyst / Algo Trading Developer', 'Kiaan Sharma Investments Pvt Ltd', 'Lucknow, India', '2021-08-01', NULL, true),
    (1, 'Automation Tester', 'TestLeaf Software', 'Chennai, India', '2022-07-01', '2022-10-31', false),
    (1, 'Assistant Manager', 'Federal Bank', 'Bangalore, India', '2019-08-01', '2021-01-31', false);

-- Insert work experience highlights
INSERT INTO work_experience_highlights (experience_id, highlight_text, display_order, achievement_type) VALUES
    (1, 'Designed, coded, and optimized algorithmic trading systems using Python and machine learning principles.', 1, 'technical'),
    (1, 'Conducted quantitative and statistical research to predict market behavior, improving model accuracy by 18%.', 2, 'quantitative'),
    (1, 'Built automation scripts for trade execution and risk analytics, reducing manual intervention by 40%.', 3, 'quantitative'),
    (1, 'Applied engineering methodologies for system reliability, performance tuning, and efficiency enhancement.', 4, 'technical'),
    (1, 'Collaborated with data vendors and IT teams for API integration, ensuring data integrity and latency reduction.', 5, 'qualitative'),
    (2, 'Developed and maintained automated regression test frameworks using Selenium WebDriver, TestNG, and Cucumber.', 1, 'technical'),
    (2, 'Applied Java OOPs principles, data structures, and modular coding to enhance software reliability.', 2, 'technical'),
    (2, 'Streamlined test case execution through Jenkins and Maven CI/CD pipelines, improving build verification time by 25%.', 3, 'quantitative'),
    (2, 'Participated in requirement analysis and defect triage meetings, contributing to higher defect detection efficiency.', 4, 'qualitative'),
    (3, 'Managed retail and SME banking portfolios, ensuring compliance with RBI regulations and risk frameworks.', 1, 'qualitative'),
    (3, 'Spearheaded digital adoption campaigns that increased online banking engagement by 30%.', 2, 'quantitative'),
    (3, 'Supervised loan processing, MIS reporting, and credit monitoring while coordinating with regional audit teams.', 3, 'qualitative'),
    (3, 'Streamlined branch operations through data automation tools and business intelligence dashboards.', 4, 'technical');

-- Insert work experience tags
INSERT INTO work_experience_tags (experience_id, tag_name) VALUES
    (1, 'Python'),
    (1, 'Machine Learning'),
    (1, 'Risk Analytics'),
    (1, 'API Integration'),
    (2, 'Selenium'),
    (2, 'Java'),
    (2, 'TestNG'),
    (2, 'Cucumber'),
    (2, 'Jenkins'),
    (3, 'Banking'),
    (3, 'Data Automation'),
    (3, 'Risk Compliance'),
    (3, 'MIS Reporting');

-- Insert education
INSERT INTO education (candidate_id, degree_type, degree_name, field_of_study, institution_name, location, start_date, is_current, description) VALUES
    (1, 'Master', 'Master of Science', 'Enterprise Resource Planning', 'Victoria University Sydney', 'Sydney, Australia', '2024-07-01', true, 'Coursework includes ERP Systems Integration, Business Process Management, Data Analytics, and Project Management.'),
    (1, 'Bachelor', 'Bachelor of Engineering', 'Electrical & Electronics', 'MIT Manipal', 'Karnataka, India', '2012-01-01', false, 'Focused on electrical systems, circuit design, automation, and control systems. GPA: 7.32/10.');

-- Insert education coursework
INSERT INTO education_coursework (education_id, course_name) VALUES
    (1, 'ERP Systems Integration'),
    (1, 'Business Process Management'),
    (1, 'Data Analytics'),
    (1, 'Project Management');

-- Insert certifications
INSERT INTO certifications (candidate_id, certification_name, issuing_organization) VALUES
    (1, 'Executive Program in Algorithmic Trading (EPAT)', 'QuantInsti'),
    (1, 'Selenium & Core Java Training', 'TestLeaf Software'),
    (1, 'Data Analytics', 'Professional Development'),
    (1, 'AI Fundamentals', 'Professional Development'),
    (1, 'Business Intelligence Tools', 'Professional Development');

-- Insert projects
INSERT INTO projects (candidate_id, project_title, project_subtitle, description) VALUES
    (1, 'Online Property Sales Platform', 'COMP9900 IT Project', 'Designed a secure online auction portal integrating user verification, property certification, and bidding workflows. Implemented data validation, user authentication, and API connectivity for real estate datasets.'),
    (1, 'LeafTaps ERP Application', 'Java-Based Testing', 'Automated 15+ ERP module test cases using Selenium WebDriver and Cucumber BDD framework. Applied XPath locators and modular frameworks for efficient test data management.'),
    (1, 'ServiceNow Cloud ITIL Application', 'Automation Suite', 'Automated 25+ regression and functional test scenarios using Page Object Model (POM). Developed automation suite integrated with CI/CD pipeline for continuous validation across releases.'),
    (1, 'Algo-Trading Strategy Backtesting', 'Quantitative Finance', 'Developed and validated algorithmic trading models using Python and statistical indicators. Conducted performance evaluation across multiple asset classes, achieving consistent backtest profitability.');

-- Insert project tags
INSERT INTO project_tags (project_id, tag_name) VALUES
    (1, 'Full-Stack'),
    (1, 'API'),
    (1, 'Authentication'),
    (1, 'Data Validation'),
    (2, 'Selenium'),
    (2, 'Cucumber'),
    (2, 'Java'),
    (2, 'BDD'),
    (3, 'ServiceNow'),
    (3, 'POM'),
    (3, 'CI/CD'),
    (3, 'Regression Testing'),
    (4, 'Python'),
    (4, 'Backtesting'),
    (4, 'Statistics'),
    (4, 'Trading');

-- Insert additional information
INSERT INTO additional_info (candidate_id, info_category, info_key, info_value) VALUES
    (1, 'visa_status', 'status', 'Australian Resident based in Sydney, actively pursuing Engineers Australia assessment for Skilled Migration (PR)'),
    (1, 'relocation', 'willing', 'Open to relocation'),
    (1, 'interests', 'areas', 'Process automation, data analytics, and smart engineering systems'),
    (1, 'professional_development', 'status', 'Continuous professional development');

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Complete profile view
CREATE OR REPLACE VIEW v_complete_profile AS
SELECT 
    cp.*,
    json_agg(DISTINCT jsonb_build_object(
        'category', sc.category_name,
        'skill', s.skill_name
    )) FILTER (WHERE s.id IS NOT NULL) as skills,
    json_agg(DISTINCT jsonb_build_object(
        'title', we.job_title,
        'company', we.company_name,
        'location', we.location,
        'start_date', we.start_date,
        'end_date', we.end_date,
        'is_current', we.is_current
    )) FILTER (WHERE we.id IS NOT NULL) as work_experience,
    json_agg(DISTINCT jsonb_build_object(
        'degree', e.degree_name,
        'field', e.field_of_study,
        'institution', e.institution_name,
        'graduation_year', e.graduation_year
    )) FILTER (WHERE e.id IS NOT NULL) as education
FROM candidate_profile cp
LEFT JOIN skills s ON cp.id = s.candidate_id
LEFT JOIN skill_categories sc ON s.category_id = sc.id
LEFT JOIN work_experience we ON cp.id = we.candidate_id
LEFT JOIN education e ON cp.id = e.candidate_id
GROUP BY cp.id;

-- Current position view
CREATE OR REPLACE VIEW v_current_positions AS
SELECT 
    cp.id,
    cp.first_name,
    cp.last_name,
    we.job_title,
    we.company_name,
    we.start_date
FROM candidate_profile cp
INNER JOIN work_experience we ON cp.id = we.candidate_id
WHERE we.is_current = true;

-- Skills summary view
CREATE OR REPLACE VIEW v_skills_summary AS
SELECT 
    cp.id as candidate_id,
    cp.first_name,
    cp.last_name,
    sc.category_name,
    array_agg(s.skill_name ORDER BY s.skill_name) as skills
FROM candidate_profile cp
JOIN skills s ON cp.id = s.candidate_id
JOIN skill_categories sc ON s.category_id = sc.id
GROUP BY cp.id, cp.first_name, cp.last_name, sc.category_name, sc.display_order
ORDER BY sc.display_order;
