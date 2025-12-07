from flask import Blueprint, request, jsonify, url_for
from ..models.candidates import Candidate
from ..models.jobmela import JobMela
from ..database import db
from werkzeug.utils import secure_filename
import os, json
from datetime import datetime
import pgeocode
import pandas as pd

blp = Blueprint("candidates", __name__, url_prefix="/candidates")

UPLOAD_FOLDER = "temp"
RESUME_FOLDER = os.path.join(UPLOAD_FOLDER, "resume")
DISABILITY_FOLDER = os.path.join(UPLOAD_FOLDER, "disability_certificate")

os.makedirs(RESUME_FOLDER, exist_ok=True)
os.makedirs(DISABILITY_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_location_by_pincode(pincode):
    try:
        nomi = pgeocode.Nominatim('IN')
        location = nomi.query_postal_code(pincode)
        if location.empty or pd.isna(location.place_name):
            return None, None, None
        city = location.place_name.split(",")[0].strip()
        state = location.state_name
        district = location.county_name if pd.notna(location.county_name) else state
        return city, district, state
    except Exception as e:
        print(f"Error fetching location: {e}")
        return None, None, None

@blp.route("/add", methods=["POST"])
def add_candidate():
    try:
        data = request.form
        print(data)
        resume = request.files.get("resume")
        disability_certificate = request.files.get("disability_certificate")

        if not resume or not allowed_file(resume.filename):
            return jsonify({"status": "error", "result": "Resume must be a PDF"}), 400
        if not disability_certificate or not allowed_file(disability_certificate.filename):
            return jsonify({"status": "error", "result": "Disability Certificate must be a PDF"}), 400

        city, district, state = get_location_by_pincode(data.get("pincode"))
        if not city or not state:
            return jsonify({"status": "error", "result": "Invalid pincode or location not found"}), 400

        name_safe = secure_filename(data.get("name"))
        resume_filename = f"{name_safe}_resume.pdf"
        disability_filename = f"{name_safe}_disability.pdf"

        resume_path = os.path.join(RESUME_FOLDER, resume_filename)
        disability_path = os.path.join(DISABILITY_FOLDER, disability_filename)

        resume.save(resume_path)
        disability_certificate.save(disability_path)

        resume_url = url_for('files.serve_resume', filename=resume_filename, _external=True)
        disability_url = url_for('files.serve_disability_certificate', filename=disability_filename, _external=True)

        jobmela_name = data.get('jobmela_name')
        jobmela = JobMela.query.filter_by(jobmela_name=jobmela_name).first()
        if not jobmela:
            return jsonify({"status": "error", "result": "Invalid JobMela name"}), 400



        candidate = Candidate(
            name=data.get("name"),
            gender=data.get("gender"),
            email=data.get("email"),
            phone=data.get("phone"),
            guardian_name=data.get("guardian_name"),
            guardian_phone=data.get("guardian_phone"),
            city=city,
            district=district,
            state=state,
            pincode=data.get("pincode"),
            degree=data.get("degree"),
            branch=data.get("branch"),
            disability_type=data.get("disability_type"),
            disability_percentage=int(data.get("disability_percentage")),
            trained_by_winvinaya=data.get("trained_by_winvinaya"),
            skills=json.loads(data.get("skills", "[]")),
            experience_type=data.get("experience_type"),
            years_of_experience=int(data.get("years_of_experience")) if data.get("years_of_experience") else None,
            current_status=data.get("current_status"),
            previous_position=data.get("previous_position"),
            ready_to_relocate=data.get("ready_to_relocate"),
            resume_path=resume_url,
            disability_certificate_path=disability_url,
            jobmela_id=jobmela.id
        )

        db.session.add(candidate)
        db.session.commit()

        return jsonify({"status": "success", "result": "Candidate registered"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to register candidate"}), 500

@blp.route("/get_all", methods=["GET"])
def get_all_candidates():
    try:
        candidates = Candidate.query.all()
        result = [
            {
                "id": c.id,
                "name": c.name,
                "gender": c.gender,
                "email": c.email,
                "phone": c.phone,
                "guardian_name": c.guardian_name,
                "guardian_phone": c.guardian_phone,
                "city": c.city,
                "district": c.district,
                "state": c.state,
                "pincode": c.pincode,
                "degree": c.degree,
                "branch": c.branch,
                "disability_type": c.disability_type,
                "disability_percentage": c.disability_percentage,
                "trained_by_winvinaya": c.trained_by_winvinaya,
                "skills": c.skills,
                "experience_type": c.experience_type,
                "years_of_experience": c.years_of_experience,
                "current_status": c.current_status,
                "previous_position": c.previous_position,
                "ready_to_relocate": c.ready_to_relocate,
                "resume_path": c.resume_path,
                "disability_certificate_path": c.disability_certificate_path,
                "jobmela_id": c.jobmela_id,
                "created_at": c.created_at.strftime("%Y-%m-%d %H:%M:%S")
            } for c in candidates
        ]
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to fetch candidates"}), 500

@blp.route("/get/<string:candidate_id>", methods=["GET"])
def get_candidate_by_id(candidate_id):
    try:
        c = Candidate.query.get(candidate_id)
        if c:
            result = {
                "id": c.id,
                "name": c.name,
                "gender": c.gender,
                "email": c.email,
                "phone": c.phone,
                "guardian_name": c.guardian_name,
                "guardian_phone": c.guardian_phone,
                "city": c.city,
                "district": c.district,
                "state": c.state,
                "pincode": c.pincode,
                "degree": c.degree,
                "branch": c.branch,
                "disability_type": c.disability_type,
                "disability_percentage": c.disability_percentage,
                "trained_by_winvinaya": c.trained_by_winvinaya,
                "skills": c.skills,
                "experience_type": c.experience_type,
                "years_of_experience": c.years_of_experience,
                "current_status": c.current_status,
                "previous_position": c.previous_position,
                "ready_to_relocate": c.ready_to_relocate,
                "resume_path": c.resume_path,
                "disability_certificate_path": c.disability_certificate_path,
                "jobmela_id": c.jobmela_id,
                "created_at": c.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            return jsonify({"status": "success", "result": result})
        return jsonify({"status": "error", "result": "Candidate not found"}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to fetch candidate"}), 500

@blp.route("/update/<string:candidate_id>", methods=["PUT"])
def update_candidate(candidate_id):
    try:
        data = request.get_json()
        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return jsonify({"status": "error", "result": "Candidate not found"}), 404

        for field in data:
            if hasattr(candidate, field):
                setattr(candidate, field, data[field])

        db.session.commit()
        return jsonify({"status": "success", "result": "Candidate updated"})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Update failed"}), 500

@blp.route("/delete/<string:candidate_id>", methods=["DELETE"])
def delete_candidate(candidate_id):
    try:
        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return jsonify({"status": "error", "result": "Candidate not found"}), 404

        db.session.delete(candidate)
        db.session.commit()
        return jsonify({"status": "success", "result": "Candidate deleted"})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Deletion failed"}), 500
