from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from app.database import db
from app.models.candidate_profile import CandidateProfile
from app.models.candidate_registration import CandidateRegistration
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

candidate_profiles_bp = Blueprint("candidate_profiles_bp", __name__, url_prefix="/api/v1/candidate-profiles")

@candidate_profiles_bp.route("/<id>", methods=["POST"])
@jwt_required()
@role_required(["admin", "sourcing"])
def create_candidate_profile(id):
    try:
        data = request.get_json(force=True)
        print(data)
        required_fields = ["trained_by_winvinaya", "employment_status"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        # Lookup candidate by candidate_id (the UUID PK from candidate_registration)
        candidate = CandidateRegistration.query.filter_by(id=id).first()
        if not candidate:
            return jsonify({
                "status": "error",
                "message": "Candidate not found."
            }), 404

        # Check if profile already exists
        existing = CandidateProfile.query.filter_by(candidate_id=candidate.id).first()
        if existing:
            return jsonify({
                "status": "error",
                "message": "Candidate profile already exists."
            }), 400

        # Get logged-in user
        user_id = get_jwt_identity()

        profile = CandidateProfile(
            id=str(uuid.uuid4()),
            candidate_id=candidate.id,
            trained_by_winvinaya=data["trained_by_winvinaya"],
            training_domain=data.get("training_domain"),
            training_from=data.get("training_from"),
            training_to=data.get("training_to"),
            employment_status=data["employment_status"],
            company_name=data.get("company_name"),
            position=data.get("position"),
            current_ctc=data.get("current_ctc"),
            total_experience_years=float(data["total_experience_years"]) if data.get("total_experience_years") is not None else None,
            notice_period=data.get("notice_period"),
            willing_for_training=data.get("willing_for_training"),
            ready_to_relocate=data.get("ready_to_relocate"),
            intrested_training=data.get("intrested_training"),
            created_by=user_id
        )

        db.session.add(profile)
        db.session.commit()

        created_by_info = get_user_info(profile.created_by) if profile.created_by else None

        response_data = {
            "id": profile.id,
            "candidate_id": candidate.candidate_id,
            "candidate_name": candidate.name,
            "trained_by_winvinaya": profile.trained_by_winvinaya,
            "training_domain": profile.training_domain,
            "training_from": profile.training_from,
            "training_to": profile.training_to,
            "employment_status": profile.employment_status,
            "company_name": profile.company_name,
            "position": profile.position,
            "current_ctc": profile.current_ctc,
            "total_experience_years": profile.total_experience_years,
            "notice_period": profile.notice_period,
            "willing_for_training": profile.willing_for_training,
            "ready_to_relocate": profile.ready_to_relocate,
            "intrested_training": profile.intrested_training,
            "created_by": created_by_info,
            "updated_by": None,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
        }

        return jsonify({
            "status": "success",
            "message": "Candidate profile created successfully.",
            "data": response_data
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@candidate_profiles_bp.route("", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing"])
def get_all_candidate_profiles():
    try:
        profiles = CandidateProfile.query.all()
        result = []
        for profile in profiles:
            candidate = CandidateRegistration.query.filter_by(id=profile.candidate_id).first()

            created_by_info = get_user_info(profile.created_by) if profile.created_by else None
            updated_by_info = get_user_info(profile.updated_by) if profile.updated_by else None

            result.append({
                "id": profile.id,
                "candidate_id": candidate.candidate_id if candidate else None,
                "candidate_name": candidate.name if candidate else None,
                "disability_certificate_path": candidate.disability_certificate_path if candidate else None,
                "trained_by_winvinaya": profile.trained_by_winvinaya,
                "training_domain": profile.training_domain,
                "training_from": profile.training_from,
                "training_to": profile.training_to,
                "employment_status": profile.employment_status,
                "company_name": profile.company_name,
                "position": profile.position,
                "current_ctc": profile.current_ctc,
                "total_experience_years": profile.total_experience_years,
                "notice_period": profile.notice_period,
                "willing_for_training": profile.willing_for_training,
                "ready_to_relocate": profile.ready_to_relocate,
                "intrested_training": profile.intrested_training,
                "created_by": created_by_info,
                "updated_by": updated_by_info,
                "created_at": profile.created_at,
                "updated_at": profile.updated_at,
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


@candidate_profiles_bp.route("/<profile_id>", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing"])
def get_candidate_profile(profile_id):
    try:
        profile = CandidateProfile.query.filter_by(id=profile_id).first()
        if not profile:
            return jsonify({
                "status": "error",
                "message": "Candidate profile not found."
            }), 404

        candidate = CandidateRegistration.query.filter_by(id=profile.candidate_id).first()

        created_by_info = get_user_info(profile.created_by) if profile.created_by else None
        updated_by_info = get_user_info(profile.updated_by) if profile.updated_by else None

        result = {
            "id": profile.id,
            "candidate_id": candidate.candidate_id if candidate else None,
            "candidate_name": candidate.name if candidate else None,
            "disability_certificate_path": candidate.disability_certificate_path if candidate else None,
            "trained_by_winvinaya": profile.trained_by_winvinaya,
            "training_domain": profile.training_domain,
            "training_from": profile.training_from,
            "training_to": profile.training_to,
            "employment_status": profile.employment_status,
            "company_name": profile.company_name,
            "position": profile.position,
            "current_ctc": profile.current_ctc,
            "total_experience_years": profile.total_experience_years,
            "notice_period": profile.notice_period,
            "willing_for_training": profile.willing_for_training,
            "ready_to_relocate": profile.ready_to_relocate,
            "intrested_training": profile.intrested_training,
            "created_by": created_by_info,
            "updated_by": updated_by_info,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
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


@candidate_profiles_bp.route("/<profile_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "sourcing"])
def update_candidate_profile(profile_id):
    try:
        profile = CandidateProfile.query.filter_by(id=profile_id).first()
        if not profile:
            return jsonify({
                "status": "error",
                "message": "Candidate profile not found."
            }), 404

        data = request.get_json()
        print(data)

        for key, value in data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)

        # Set updated_by
        user_id = get_jwt_identity()
        profile.updated_by = user_id
        profile.updated_at = datetime.utcnow()

        db.session.commit()

        updated_by_info = get_user_info(profile.updated_by) if profile.updated_by else None

        return jsonify({
            "status": "success",
            "message": "Candidate profile updated successfully.",
            "updated_by": updated_by_info
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@candidate_profiles_bp.route("/<profile_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "sourcing"])
def delete_candidate_profile(profile_id):
    try:
        profile = CandidateProfile.query.filter_by(id=profile_id).first()
        if not profile:
            return jsonify({
                "status": "error",
                "message": "Candidate profile not found."
            }), 404

        db.session.delete(profile)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Candidate profile deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
