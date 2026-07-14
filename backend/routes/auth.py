from flask import Blueprint, request, jsonify
from backend.models.db_helper import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    branch = data.get('branch', 'CSE')
    section = data.get('section') if role == 'student' else None
    roll = data.get('roll') if role == 'student' else None

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check for existing user
    cursor.execute("SELECT email FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        return jsonify({"error": "Email already registered"}), 409

    # Insert new user
    cursor.execute("""
        INSERT INTO users (email, password, name, role, branch, section, roll)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (email, password, name, role, branch, section, roll))
    conn.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "email": email,
            "name": name,
            "role": role,
            "branch": branch,
            "section": section,
            "roll": roll
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user or user['password'] != password:
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "email": user['email'],
            "name": user['name'],
            "role": user['role'],
            "branch": user['branch'],
            "section": user['section'],
            "roll": user['roll']
        }
    }), 200
