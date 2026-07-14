import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DATABASE_PATH = os.path.join(BASE_DIR, 'database.db')
UPLOAD_ASSIGNMENTS_DIR = os.path.join(BASE_DIR, 'uploads', 'assignments')
UPLOAD_SUBMISSIONS_DIR = os.path.join(BASE_DIR, 'uploads', 'submissions')

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg'}

SECRET_KEY = 'aligned-assigner-secret-key-12345'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB limit
