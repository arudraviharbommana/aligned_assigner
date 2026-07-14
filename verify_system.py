import os
import sys
import time
import threading
import urllib.request
import urllib.error
import json
import sqlite3

# Adjust path to import backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app import app
from backend.config import DATABASE_PATH, UPLOAD_ASSIGNMENTS_DIR, UPLOAD_SUBMISSIONS_DIR

def run_server():
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

def test_api():
    print("=== Aligned Assigner API Integration Tests ===")
    
    # 1. Test Login (Demo User)
    login_url = "http://127.0.0.1:5000/api/login"
    login_data = json.dumps({
        "email": "student@test.com",
        "password": "password"
      }).encode('utf-8')
    
    req = urllib.request.Request(
        login_url, 
        data=login_data, 
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("OK - Login successful:", res_data['user']['name'])
            assert res_data['user']['role'] == 'student'
    except Exception as e:
        print("FAIL - Login failed:", e)
        return False

    # 2. Test Signup (New User)
    signup_url = "http://127.0.0.1:5000/api/signup"
    signup_data = json.dumps({
        "name": "Prof. Test",
        "email": "proftest@test.com",
        "password": "password",
        "role": "professor",
        "branch": "CSE"
      }).encode('utf-8')
    
    req = urllib.request.Request(
        signup_url, 
        data=signup_data, 
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("OK - Signup successful:", res_data['user']['name'])
            assert res_data['user']['email'] == 'proftest@test.com'
    except Exception as e:
        print("FAIL - Signup failed:", e)
        return False

    # 3. Test Get Assignments
    get_assignments_url = "http://127.0.0.1:5000/api/assignments?branch=CSE&section=1"
    try:
        with urllib.request.urlopen(get_assignments_url) as res:
            assignments = json.loads(res.read().decode('utf-8'))
            print("OK - Get Assignments successful. Found:", len(assignments))
            assert len(assignments) >= 2
            # Verify seeded submission details are included
            sub_count = sum(len(a['submissions']) for a in assignments)
            print("  Seeded submissions found:", sub_count)
            assert sub_count >= 1
    except Exception as e:
        print("FAIL - Get Assignments failed:", e)
        return False

    # 4. Test Review Submission
    # Let's review the student's submission on assignment 1 (status: Submitted -> Approved)
    review_url = "http://127.0.0.1:5000/api/review"
    review_data = json.dumps({
        "assignment_id": "1",
        "student_email": "student@test.com",
        "status": "Approved"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        review_url,
        data=review_data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("OK - Review Submission successful:", res_data['message'])
            assert res_data['status'] == 'Approved'
    except Exception as e:
        print("FAIL - Review Submission failed:", e)
        return False

    # Verify state in DB
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM submissions WHERE assignment_id = '1' AND student_email = 'student@test.com'")
        row = cursor.fetchone()
        assert row is not None
        assert row[0] == 'Approved'
        print("OK - Database state verification: status is 'Approved'")
        conn.close()
    except Exception as e:
        print("FAIL - Database state verification failed:", e)
        return False

    print("\nALL TESTS PASSED SUCCESSFULLY!")
    return True

if __name__ == '__main__':
    # Start Flask server in a daemon thread
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    # Wait a bit for the server to spin up
    time.sleep(1.5)
    
    success = test_api()
    sys.exit(0 if success else 1)
