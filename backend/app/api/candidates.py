from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import json

from app.database import db
from app.models.candidate_registration import CandidateRegistration
from app.models.candidate_profile import CandidateProfile
from app.helpers.utils import get_location_by_pincode
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info
from app.helpers.activity_logger import log_activity

candidates_bp = Blueprint("candidates_bp", __name__, url_prefix="/api/v1/candidates")

@candidates_bp.route("", methods=["POST"])
def create_candidate():
    try:
        data = request.form.to_dict()

        required_fields = [
            "name", "gender", "email", "phone",
            "guardian_name", "guardian_phone", "pincode",
            "degree", "branch", "disability_type",
            "disability_percentage", "experience_type"
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        # Lookup location info using pincode
        location = get_location_by_pincode(data["pincode"])
        if not location:
            return jsonify({
                "status": "error",
                "message": f"Invalid or unknown pincode: {data['pincode']}"
            }), 400

        # Check email uniqueness
        existing = CandidateRegistration.query.filter_by(email=data["email"]).first()
        if existing:
            return jsonify({
                "status": "error",
                "message": "Candidate with this email already exists."
            }), 400

        # Handle optional file upload
        disability_certificate_path = None
        if "disability_certificate" in request.files:
            file = request.files["disability_certificate"]
            if file and file.filename != "":
                now = datetime.utcnow()
                month_year = now.strftime("%m%Y")
                folder_path = os.path.join(
                    "temp",
                    "disability_certificate",
                    month_year
                )
                os.makedirs(folder_path, exist_ok=True)

                ext = os.path.splitext(file.filename)[-1]
                file_name = f"{data['name'].replace(' ', '_')}_disability_certificate{ext}"
                save_path = os.path.join(folder_path, secure_filename(file_name))
                file.save(save_path)
                disability_certificate_path = save_path

        # Parse JSON field skills
        skills = request.form.get("skills")
        if skills:
            try:
                skills = json.loads(skills)
            except json.JSONDecodeError:
                return jsonify({
                    "status": "error",
                    "message": "Invalid JSON format for skills field."
                }), 400

        candidate = CandidateRegistration(
            id=str(uuid.uuid4()),
            name=data["name"],
            gender=data["gender"],
            email=data["email"],
            phone=data["phone"],
            guardian_name=data["guardian_name"],
            guardian_phone=data["guardian_phone"],
            city=location["city"],
            district=location["district"],
            state=location["state"],
            pincode=data["pincode"],
            degree=data["degree"],
            branch=data["branch"],
            disability_type=data["disability_type"],
            disability_percentage=int(data["disability_percentage"]),
            experience_type=data["experience_type"],
            skills=skills,
            disability_certificate_path=disability_certificate_path,
        )

        db.session.add(candidate)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Candidate registered successfully.",
            "data": {
                "id": candidate.id,
                "candidate_id": candidate.candidate_id,
                "name": candidate.name,
                "email": candidate.email,
                "city": candidate.city,
                "district": candidate.district,
                "state": candidate.state,
                "disability_certificate_path": disability_certificate_path
            }
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@candidates_bp.route("", methods=["GET"])
def get_all_candidates():
    try:
        candidates = CandidateRegistration.query.all()
        candidate_ids = [c.id for c in candidates]  # Collect all candidate IDs

        # Fetch all profiles for these candidate IDs
        profiles = CandidateProfile.query.with_entities(
            CandidateProfile.candidate_id,
            CandidateProfile.id
        ).filter(CandidateProfile.candidate_id.in_(candidate_ids)).all()

        # Build a map of candidate_id -> profile_id
        profile_map = {p.candidate_id: p.id for p in profiles}

        result = []
        for c in candidates:
            updated_by_info = get_user_info(c.updated_by) if c.updated_by else None
            profile_id = profile_map.get(c.id)  # Now correctly mapped

            result.append({
                "id": c.id,
                "candidate_id": c.candidate_id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "gender": c.gender,
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
                "skills": c.skills,
                "experience_type": c.experience_type,
                "disability_certificate_path": c.disability_certificate_path,
                "updated_by": updated_by_info,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
                "profile_id": profile_id  # ✅ Correctly appended
            })
            
        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@candidates_bp.route("/<id>", methods=["GET"])
def get_candidate(id):
    try:
        candidate = CandidateRegistration.query.filter_by(id=id).first()
        if not candidate:
            return jsonify({
                "status": "error",
                "message": "Candidate not found."
            }), 404

        # 🔍 Get associated profile
        profile = CandidateProfile.query.filter_by(candidate_id=candidate.id).first()
        profile_id = profile.id if profile else None

        updated_by_info = None
        if candidate.updated_by:
            updated_by_info = get_user_info(candidate.updated_by)

        result = {
            "id": candidate.id,
            "candidate_id": candidate.candidate_id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "gender": candidate.gender,
            "guardian_name": candidate.guardian_name,
            "guardian_phone": candidate.guardian_phone,
            "city": candidate.city,
            "district": candidate.district,
            "state": candidate.state,
            "pincode": candidate.pincode,
            "degree": candidate.degree,
            "branch": candidate.branch,
            "disability_type": candidate.disability_type,
            "disability_percentage": candidate.disability_percentage,
            "skills": candidate.skills,
            "experience_type": candidate.experience_type,
            "disability_certificate_path": candidate.disability_certificate_path,
            "updated_by": updated_by_info,
            "created_at": candidate.created_at,
            "updated_at": candidate.updated_at,
            "profile_id": profile_id
        }

        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@candidates_bp.route("/<id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "sourcing"])
def update_candidate(id):
    try:
        current_user_id = get_jwt_identity()
        current_user_role = get_user_info(current_user_id)

        data = request.form.to_dict() if request.content_type.startswith("multipart/form-data") else request.get_json() or {}
        candidate = CandidateRegistration.query.filter_by(id=id).first()

        if not candidate:
            return jsonify({"status": "error", "message": "Candidate not found."}), 404

        changed_fields = {}

        if "pincode" in data:
            location = get_location_by_pincode(data["pincode"])
            if not location:
                return jsonify({"status": "error", "message": f"Invalid or unknown pincode: {data['pincode']}"}), 400
            if candidate.pincode != data["pincode"]:
                changed_fields["pincode"] = {"old": candidate.pincode, "new": data["pincode"]}
            candidate.city = location["city"]
            candidate.district = location["district"]
            candidate.state = location["state"]
            candidate.pincode = data["pincode"]

        for key, value in data.items():
            if key not in ["city", "district", "state", "pincode", "skills"]:
                if hasattr(candidate, key):
                    old_value = getattr(candidate, key)
                    if old_value != value:
                        changed_fields[key] = {"old": old_value, "new": value}
                        setattr(candidate, key, value)

        if "skills" in data:
            try:
                new_skills = json.loads(data["skills"]) if isinstance(data["skills"], str) else data["skills"]
                if candidate.skills != new_skills:
                    changed_fields["skills"] = {"old": candidate.skills, "new": new_skills}
                    candidate.skills = new_skills
            except json.JSONDecodeError:
                return jsonify({"status": "error", "message": "Invalid JSON format for skills."}), 400

        if "disability_certificate" in request.files:
            file = request.files["disability_certificate"]
            if file and file.filename:
                if candidate.disability_certificate_path and os.path.exists(candidate.disability_certificate_path):
                    os.remove(candidate.disability_certificate_path)

                now = datetime.utcnow()
                month_year = now.strftime("%m%Y")
                folder_path = os.path.join("uploads", "disability_certificate", month_year)
                os.makedirs(folder_path, exist_ok=True)

                ext = os.path.splitext(file.filename)[-1]
                file_name = f"{uuid.uuid4().hex}_disability_certificate{ext}"
                save_path = os.path.join(folder_path, secure_filename(file_name))
                file.save(save_path)

                changed_fields["disability_certificate_path"] = {
                    "old": candidate.disability_certificate_path,
                    "new": save_path
                }
                candidate.disability_certificate_path = save_path

        candidate.updated_by = current_user_id
        candidate.updated_at = datetime.utcnow()
        db.session.commit()

        log_activity(
            table_name="candidate_registration",
            record_id=candidate.id,
            action="PUT",
            user_id=current_user_id,
            role=current_user_role,
            changed_fields=changed_fields
        )

        return jsonify({"status": "success", "message": "Candidate updated successfully."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ---------------- DELETE CANDIDATE ----------------
@candidates_bp.route("/<id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_candidate(id):
    try:
        current_user_id = get_jwt_identity()
        current_user_role = get_user_info(current_user_id)

        candidate = CandidateRegistration.query.filter_by(id=id).first()
        if not candidate:
            return jsonify({"status": "error", "message": "Candidate not found."}), 404

        db.session.delete(candidate)
        db.session.commit()

        log_activity(
            table_name="candidate_registration",
            record_id=id,
            action="DELETE",
            user_id=current_user_id,
            role=current_user_role
        )

        return jsonify({"status": "success", "message": "Candidate deleted successfully."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500