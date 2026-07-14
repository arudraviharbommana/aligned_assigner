import os
import time
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.models.db_helper import get_db
from backend.config import UPLOAD_SUBMISSIONS_DIR, ALLOWED_EXTENSIONS

submissions_bp = Blueprint('submissions', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@submissions_bp.route('/submit', methods=['POST'])
def submit():
    # Supports multipart/form-data or application/json
    assignment_id = request.form.get('assignment_id')
    student_email = request.form.get('student_email')
    student_name = request.form.get('student_name')
    roll = request.form.get('roll')
    submitted_at = request.form.get('submitted_at') or time.strftime('%Y-%m-%d')

    if not assignment_id and request.is_json:
        data = request.get_json() or {}
        assignment_id = data.get('assignment_id')
        student_email = data.get('student_email')
        student_name = data.get('student_name')
        roll = data.get('roll')
        submitted_at = data.get('submitted_at') or time.strftime('%Y-%m-%d')
        submitted_file = data.get('submitted_file')
    else:
        submitted_file = None

    if not all([assignment_id, student_email, student_name, roll]):
        return jsonify({"error": "Missing submission fields"}), 400

    # Handle file upload if present
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename != '':
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                os.makedirs(UPLOAD_SUBMISSIONS_DIR, exist_ok=True)
                # Append epoch timestamp to prevent collision
                timestamp = int(time.time())
                name_parts = filename.rsplit('.', 1)
                unique_filename = f"{name_parts[0]}_{timestamp}.{name_parts[1]}"
                
                file.save(os.path.join(UPLOAD_SUBMISSIONS_DIR, unique_filename))
                submitted_file = unique_filename
            else:
                return jsonify({"error": "File extension not allowed"}), 400

    # If no file uploaded but reference filename provided in form text
    if not submitted_file and request.form.get('submitted_file'):
        submitted_file = request.form.get('submitted_file')

    if not submitted_file:
        return jsonify({"error": "No file uploaded or specified"}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Manual UPSERT
    cursor.execute("""
        SELECT student_name, roll FROM submissions 
        WHERE assignment_id = ? AND student_email = ?
    """, (assignment_id, student_email))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            UPDATE submissions 
            SET submitted_file = ?, submitted_at = ?, status = 'Submitted'
            WHERE assignment_id = ? AND student_email = ?
        """, (submitted_file, submitted_at, assignment_id, student_email))
    else:
        cursor.execute("""
            INSERT INTO submissions (assignment_id, student_email, student_name, roll, submitted_file, submitted_at, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Submitted')
        """, (assignment_id, student_email, student_name, roll, submitted_file, submitted_at))

    conn.commit()

    return jsonify({
        "message": "Submission uploaded successfully",
        "submission": {
            "assignment_id": assignment_id,
            "studentEmail": student_email,
            "studentName": student_name,
            "roll": roll,
            "submittedFile": submitted_file,
            "submittedAt": submitted_at,
            "status": "Submitted"
        }
    }), 200

@submissions_bp.route('/review', methods=['POST'])
def review():
    data = request.get_json() or {}
    assignment_id = data.get('assignment_id')
    student_email = data.get('student_email')
    status = data.get('status')  # 'Approved' or 'Failed Approval'

    if not all([assignment_id, student_email, status]):
        return jsonify({"error": "Missing review fields"}), 400

    if status not in ['Approved', 'Failed Approval']:
        return jsonify({"error": "Invalid review status"}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check if submission exists
    cursor.execute("""
        SELECT 1 FROM submissions 
        WHERE assignment_id = ? AND student_email = ?
    """, (assignment_id, student_email))
    if not cursor.fetchone():
        return jsonify({"error": "Submission not found"}), 404

    # Update status
    cursor.execute("""
        UPDATE submissions 
        SET status = ? 
        WHERE assignment_id = ? AND student_email = ?
    """, (status, assignment_id, student_email))
    conn.commit()

    return jsonify({
        "message": f"Submission status updated to {status}",
        "assignment_id": assignment_id,
        "student_email": student_email,
        "status": status
    }), 200
