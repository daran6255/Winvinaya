from flask import Blueprint, send_from_directory, current_app

file_blp = Blueprint("files", __name__, url_prefix="/files")

@file_blp.route("/resume/<filename>", methods=["GET"])
def serve_resume(filename):
    return send_from_directory(current_app.config['RESUME_FOLDER'], filename)

@file_blp.route("/disability/<filename>", methods=["GET"])
def serve_disability_certificate(filename):
    return send_from_directory(current_app.config['DISABILITY_FOLDER'], filename)
