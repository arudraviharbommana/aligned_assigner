import sqlite3
from flask import g
from backend.config import DATABASE_PATH

def get_db_connection():
    """Acquires a database connection, configuring foreign keys."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def get_db():
    """Get the current request-bound database connection."""
    if 'db' not in g:
        g.db = get_db_connection()
    return g.db

def close_db(e=None):
    """Close the request-bound database connection."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Initializes the SQLite database with schemas and seeds seed data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            branch TEXT NOT NULL,
            section TEXT,
            roll TEXT
        );
    ''')

    # Create Assignments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id TEXT PRIMARY KEY,
            subject TEXT NOT NULL,
            branch TEXT NOT NULL,
            section TEXT NOT NULL,
            title TEXT NOT NULL,
            instructions TEXT NOT NULL,
            deadline TEXT NOT NULL,
            file_name TEXT
        );
    ''')

    # Create Submissions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            assignment_id TEXT NOT NULL,
            student_email TEXT NOT NULL,
            student_name TEXT NOT NULL,
            roll TEXT NOT NULL,
            submitted_file TEXT NOT NULL,
            submitted_at TEXT NOT NULL,
            status TEXT NOT NULL,
            PRIMARY KEY (assignment_id, student_email),
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
            FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE
        );
    ''')

    conn.commit()

    # Seed Default Users if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO users (email, password, name, role, branch, section, roll)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("student@test.com", "password", "Arudra", "student", "CSE", "1", "220101"))
        
        cursor.execute("""
            INSERT INTO users (email, password, name, role, branch, section, roll)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("prof@test.com", "password", "Dr. Ramesh", "professor", "CSE", None, None))
        
        conn.commit()

    # Seed Default Assignments if empty
    cursor.execute("SELECT COUNT(*) FROM assignments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO assignments (id, subject, branch, section, title, instructions, deadline, file_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("1", "DSA", "CSE", "1", "Red-Black Trees Implementation", 
              "Implement insertion and deletion operations in C++.", "2026-07-20", "dsa_assignment_1.pdf"))

        cursor.execute("""
            INSERT INTO assignments (id, subject, branch, section, title, instructions, deadline, file_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("2", "DBMS", "CSE", "1", "Normal Forms and ER Modeling", 
              "Solve the normalization problems up to BCNF.", "2026-07-25", "dbms_homework.docx"))
        
        # Seed student submission for assignment 1
        cursor.execute("""
            INSERT INTO submissions (assignment_id, student_email, student_name, roll, submitted_file, submitted_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("1", "student@test.com", "Arudra", "220101", "arudra_dsa_submission.docx", "2026-07-14", "Submitted"))
        
        conn.commit()

    conn.close()
