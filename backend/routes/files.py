import os
from flask import Blueprint, send_from_directory, jsonify, make_response
from backend.config import UPLOAD_ASSIGNMENTS_DIR, UPLOAD_SUBMISSIONS_DIR

files_bp = Blueprint('files', __name__)

def get_directory(type_folder):
    if type_folder == 'assignments':
        return UPLOAD_ASSIGNMENTS_DIR
    elif type_folder == 'submissions':
        return UPLOAD_SUBMISSIONS_DIR
    return None

@files_bp.route('/download/<type_folder>/<filename>', methods=['GET'])
def download_file(type_folder, filename):
    directory = get_directory(type_folder)
    if not directory:
        return jsonify({"error": "Invalid file type folder"}), 400

    file_path = os.path.join(directory, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(directory, filename, as_attachment=True)

@files_bp.route('/preview/<type_folder>/<filename>', methods=['GET'])
def preview_file(type_folder, filename):
    directory = get_directory(type_folder)
    if not directory:
        return jsonify({"error": "Invalid file type folder"}), 400

    file_path = os.path.join(directory, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    # We want to serve inline
    response = make_response(send_from_directory(directory, filename, as_attachment=False))
    
    # Optional CORS headers specifically for binary previews if needed
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
