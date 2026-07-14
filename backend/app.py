import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from flask_cors import CORS
from backend.config import SECRET_KEY, MAX_CONTENT_LENGTH, UPLOAD_ASSIGNMENTS_DIR, UPLOAD_SUBMISSIONS_DIR
from backend.models.db_helper import init_db, close_db
from backend.routes.auth import auth_bp
from backend.routes.assignments import assignments_bp
from backend.routes.submissions import submissions_bp
from backend.routes.files import files_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

    # Enable CORS for frontend on Port 3000 (and any port in dev)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Ensure upload directories exist
    os.makedirs(UPLOAD_ASSIGNMENTS_DIR, exist_ok=True)
    os.makedirs(UPLOAD_SUBMISSIONS_DIR, exist_ok=True)

    # Initialize Database
    with app.app_context():
        init_db()

    # Register blueprints to match the URL scheme
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
    app.register_blueprint(submissions_bp, url_prefix='/api')
    app.register_blueprint(files_bp, url_prefix='/api/files')

    # Register database teardown handler
    app.teardown_appcontext(close_db)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
