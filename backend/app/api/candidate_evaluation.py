from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from app.database import db
from app.models.candidate_evaluation import CandidateEvaluation
from app.models.candidate_profile import CandidateProfile
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

candidate_evaluations_bp = Blueprint("candidate_evaluations_bp", __name__, url_prefix="/api/v1/candidate-evaluations")


@candidate_evaluations_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "trainer"])
def create_candidate_evaluation():
    try:
        data = request.get_json()

        required_fields = ["candidate_profile_id", "status"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        # Check if candidate profile exists
        profile = CandidateProfile.query.filter_by(id=data["candidate_profile_id"]).first()
        if not profile:
            return jsonify({
                "status": "error",
                "message": "Candidate Profile not found."
            }), 404

        # Check if evaluation already exists for the profile
        existing = CandidateEvaluation.query.filter_by(candidate_profile_id=data["candidate_profile_id"]).first()
        if existing:
            return jsonify({
                "status": "error",
                "message": "Candidate Evaluation already exists for this profile."
            }), 400

        user_id = get_jwt_identity()

        evaluation = CandidateEvaluation(
            id=str(uuid.uuid4()),
            candidate_profile_id=data["candidate_profile_id"],
            skills_with_level=data.get("skills_with_level"),
            suitable_training=data.get("suitable_training"),
            comments=data.get("comments"),
            remarks=data.get("remarks"),
            status=data["status"],
            created_by=user_id
        )

        db.session.add(evaluation)
        db.session.commit()

        created_by_info = get_user_info(evaluation.created_by) if evaluation.created_by else None

        return jsonify({
            "status": "success",
            "message": "Candidate Evaluation created successfully.",
            "data": {
                "id": evaluation.id,
                "created_by": created_by_info
            }
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@candidate_evaluations_bp.route("", methods=["GET"])
@jwt_required()
@role_required(["admin", "trainer"])
def get_all_candidate_evaluations():
    try:
        evaluations = CandidateEvaluation.query.all()
        result = []
        for ev in evaluations:
            created_by_info = get_user_info(ev.created_by) if ev.created_by else None
            updated_by_info = get_user_info(ev.updated_by) if ev.updated_by else None

            result.append({
                "id": ev.id,
                "candidate_profile_id": ev.candidate_profile_id,
                "skills_with_level": ev.skills_with_level,
                "suitable_training": ev.suitable_training,
                "comments": ev.comments,
                "remarks": ev.remarks,
                "status": ev.status,
                "created_by": created_by_info,
                "updated_by": updated_by_info,
                "created_at": ev.created_at,
                "updated_at": ev.updated_at,
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


@candidate_evaluations_bp.route("/<evaluation_id>", methods=["GET"])
@jwt_required()
@role_required(["admin", "trainer"])
def get_candidate_evaluation(evaluation_id):
    try:
        ev = CandidateEvaluation.query.filter_by(id=evaluation_id).first()
        if not ev:
            return jsonify({
                "status": "error",
                "message": "Candidate Evaluation not found."
            }), 404

        created_by_info = get_user_info(ev.created_by) if ev.created_by else None
        updated_by_info = get_user_info(ev.updated_by) if ev.updated_by else None

        result = {
            "id": ev.id,
            "candidate_profile_id": ev.candidate_profile_id,
            "skills_with_level": ev.skills_with_level,
            "suitable_training": ev.suitable_training,
            "comments": ev.comments,
            "remarks": ev.remarks,
            "status": ev.status,
            "created_by": created_by_info,
            "updated_by": updated_by_info,
            "created_at": ev.created_at,
            "updated_at": ev.updated_at,
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


@candidate_evaluations_bp.route("/<evaluation_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "trainer"])
def update_candidate_evaluation(evaluation_id):
    try:
        ev = CandidateEvaluation.query.filter_by(id=evaluation_id).first()
        if not ev:
            return jsonify({
                "status": "error",
                "message": "Candidate Evaluation not found."
            }), 404

        data = request.get_json()

        for key, value in data.items():
            if hasattr(ev, key):
                setattr(ev, key, value)

        user_id = get_jwt_identity()
        ev.updated_by = user_id
        ev.updated_at = datetime.utcnow()

        db.session.commit()

        updated_by_info = get_user_info(ev.updated_by) if ev.updated_by else None

        return jsonify({
            "status": "success",
            "message": "Candidate Evaluation updated successfully.",
            "updated_by": updated_by_info
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@candidate_evaluations_bp.route("/<evaluation_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "sourcing"])
def delete_candidate_evaluation(evaluation_id):
    try:
        ev = CandidateEvaluation.query.filter_by(id=evaluation_id).first()
        if not ev:
            return jsonify({
                "status": "error",
                "message": "Candidate Evaluation not found."
            }), 404

        db.session.delete(ev)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Candidate Evaluation deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
