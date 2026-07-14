import os
import time
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.models.db_helper import get_db
from backend.config import UPLOAD_ASSIGNMENTS_DIR, ALLOWED_EXTENSIONS

assignments_bp = Blueprint('assignments', __name__)

def allowed_file(filename):
    return True

@assignments_bp.route('', methods=['GET'])
@assignments_bp.route('/', methods=['GET'])
def get_assignments():
    branch = request.args.get('branch')
    section = request.args.get('section')
    student_email = request.args.get('student_email')

    conn = get_db()
    cursor = conn.cursor()

    # Query assignments
    query = "SELECT * FROM assignments"
    params = []
    conditions = []

    if branch:
        conditions.append("branch = ?")
        params.append(branch)
    if section:
        conditions.append("section = ?")
        params.append(section)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    # Order by creation (newest first, if epoch ID is used)
    query += " ORDER BY id DESC"

    cursor.execute(query, params)
    assignments_rows = cursor.fetchall()

    assignments_list = []
    for row in assignments_rows:
        assignment_id = row['id']
        # Fetch submissions for this assignment
        if student_email:
            # Filtered for specific student
            cursor.execute("""
                SELECT * FROM submissions 
                WHERE assignment_id = ? AND student_email = ?
            """, (assignment_id, student_email))
        else:
            # All submissions (for teachers)
            cursor.execute("""
                SELECT * FROM submissions 
                WHERE assignment_id = ?
            """, (assignment_id,))
            
        submissions_rows = cursor.fetchall()
        submissions_list = []
        for sub in submissions_rows:
            submissions_list.append({
                "studentEmail": sub['student_email'],
                "studentName": sub['student_name'],
                "roll": sub['roll'],
                "submittedFile": sub['submitted_file'],
                "submittedAt": sub['submitted_at'],
                "status": sub['status']
            })

        assignments_list.append({
            "id": row['id'],
            "subject": row['subject'],
            "branch": row['branch'],
            "section": row['section'],
            "title": row['title'],
            "instructions": row['instructions'],
            "deadline": row['deadline'],
            "fileName": row['file_name'],
            "submissions": submissions_list
        })

    return jsonify(assignments_list), 200

@assignments_bp.route('', methods=['POST'])
@assignments_bp.route('/', methods=['POST'])
def create_assignment():
    # Supports multipart/form-data or standard application/json
    subject = request.form.get('subject')
    branch = request.form.get('branch')
    section = request.form.get('section')
    title = request.form.get('title')
    instructions = request.form.get('instructions')
    deadline = request.form.get('deadline')

    # If JSON is sent instead
    if not subject and request.is_json:
        data = request.get_json() or {}
        subject = data.get('subject')
        branch = data.get('branch')
        section = data.get('section')
        title = data.get('title')
        instructions = data.get('instructions')
        deadline = data.get('deadline')
        file_name = data.get('fileName')
    else:
        file_name = None

    if not all([subject, branch, section, title, instructions, deadline]):
        return jsonify({"error": "Missing assignment fields"}), 400

    # Handle file upload if present in form-data
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename != '':
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Ensure path exists
                os.makedirs(UPLOAD_ASSIGNMENTS_DIR, exist_ok=True)
                # Add epoch timestamp to filename to prevent collisions
                timestamp = int(time.time())
                name_parts = filename.rsplit('.', 1)
                unique_filename = f"{name_parts[0]}_{timestamp}.{name_parts[1]}"
                
                file.save(os.path.join(UPLOAD_ASSIGNMENTS_DIR, unique_filename))
                file_name = unique_filename
            else:
                return jsonify({"error": "File extension not allowed"}), 400

    # If no file uploaded but reference filename provided (as fallback or mock)
    if not file_name and request.form.get('fileName'):
        file_name = request.form.get('fileName')

    # Generate Epoch ID
    assignment_id = str(int(time.time() * 1000))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO assignments (id, subject, branch, section, title, instructions, deadline, file_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (assignment_id, subject, branch, section, title, instructions, deadline, file_name))
    conn.commit()

    return jsonify({
        "message": "Assignment created successfully",
        "assignment": {
            "id": assignment_id,
            "subject": subject,
            "branch": branch,
            "section": section,
            "title": title,
            "instructions": instructions,
            "deadline": deadline,
            "fileName": file_name
        }
    }), 201
