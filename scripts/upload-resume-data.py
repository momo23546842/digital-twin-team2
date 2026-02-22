#!/usr/bin/env python3
"""
Script to upload Rohan Sharma's resume data to PostgreSQL database
Reads connection details from .env.local and executes the schema.sql file

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

def upload_resume_data():
    """Main function to upload resume data"""
    print("🚀 Starting Resume Data Upload\n")
    print("=" * 60)
    
    # Load environment
    load_env()
    
    # Get connection string
    conn_string = get_connection_string()
    
    # Read schema
    sql_content = read_schema_file()
    statements = parse_sql_statements(sql_content)
    
    print(f"📝 Found {len(statements)} SQL statements to execute\n")
    
    # Connect to database
    try:
        print("🔌 Connecting to PostgreSQL database...")
        conn = psycopg2.connect(conn_string)
        conn.set_session(autocommit=False)
        cur = conn.cursor()
        
        print(f"✅ Connected successfully")
        print(f"📍 Database: {os.getenv('PGDATABASE', 'neondb')}")
        print(f"🖥️  Host: {os.getenv('PGHOST', 'unknown')}\n")
        
        success_count = 0
        skip_count = 0
        
        print("🔄 Executing SQL statements...\n")
        
        for i, statement in enumerate(statements, 1):
            if not statement or len(statement) < 5:
                continue
            
            try:
                # Show progress for major operations
                stmt_upper = statement.upper()
                
                if 'CREATE TABLE' in stmt_upper:
                    import re
                    match = re.search(r'CREATE TABLE (?:IF NOT EXISTS )?(\w+)', statement, re.I)
                    if match:
                        print(f"  ✓ Creating table: {match.group(1)}")
                
                elif 'INSERT INTO' in stmt_upper:
                    if 'SELECT' not in stmt_upper:
                        sys.stdout.write('.')
                        sys.stdout.flush()
                
                elif 'CREATE INDEX' in stmt_upper:
                    import re
                    match = re.search(r'CREATE INDEX (\w+)', statement, re.I)
                    if match:
                        print(f"  ✓ Creating index: {match.group(1)}")
                
                elif 'CREATE OR REPLACE VIEW' in stmt_upper:
                    import re
                    match = re.search(r'CREATE OR REPLACE VIEW (\w+)', statement, re.I)
                    if match:
                        print(f"  ✓ Creating view: {match.group(1)}")
                
                cur.execute(statement)
                success_count += 1
                
            except psycopg2.Error as e:
                # Skip errors for already existing objects
                if e.pgcode in ('42P07', '42710', '23505'):  # relation/object exists, unique violation
                    skip_count += 1
                else:
                    print(f"\n❌ Error executing statement {i}:")
                    print(f"   {e}")
                    print(f"   Statement: {statement[:100]}...")
                    raise
        
        # Commit transaction
        conn.commit()
        print("\n\n✅ Transaction committed successfully!")
        print(f"📊 Summary:")
        print(f"   - Statements executed: {success_count}")
        print(f"   - Statements skipped: {skip_count}")
        print(f"   - Total: {len(statements)}")
        
        # Verify data
        print("\n🔍 Verifying uploaded data...")
        
        cur.execute(
            "SELECT id, first_name, last_name, email, current_position "
            "FROM candidate_profile LIMIT 1"
        )
        candidate = cur.fetchone()
        
        if candidate:
            print(f"   ✓ Candidate: {candidate[1]} {candidate[2]}")
            print(f"   ✓ Email: {candidate[3]}")
            print(f"   ✓ Position: {candidate[4]}")
        
        cur.execute("SELECT COUNT(*) FROM skills WHERE candidate_id = 1")
        print(f"   ✓ Skills: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM work_experience WHERE candidate_id = 1")
        print(f"   ✓ Work Experience: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM projects WHERE candidate_id = 1")
        print(f"   ✓ Projects: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM education WHERE candidate_id = 1")
        print(f"   ✓ Education: {cur.fetchone()[0]}")
        
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
