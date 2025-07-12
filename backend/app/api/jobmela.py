from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from app.database import db
from app.models.jobmela import JobMela
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

jobmela_bp = Blueprint("jobmela_bp", __name__, url_prefix="/api/v1/jobmelas")


@jobmela_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "placement"])
def create_jobmela():
    """
    Create a new Job Mela event.
    Requires admin or placement role.
    """
    try:
        data = request.get_json()
        required_fields = ["jobmela_name", "jobmela_date", "jobmela_location", "jobmela_partner"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"status": "error", "message": f"{field} is required"}), 400

        current_user_id = get_jwt_identity()

        jobmela = JobMela(
            id=str(uuid.uuid4()),
            jobmela_name=data["jobmela_name"],
            jobmela_date=datetime.fromisoformat(data["jobmela_date"]),
            jobmela_location=data["jobmela_location"],
            jobmela_partner=data["jobmela_partner"],
            created_by=current_user_id
        )
        db.session.add(jobmela)
        db.session.commit()

        return jsonify({"status": "success", "message": "Job Mela created", "jobmela_id": jobmela.id}), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@jobmela_bp.route("", methods=["GET"])
@jwt_required()
def get_all_jobmelas():
    """
    Get a list of all Job Melas.
    """
    try:
        jobmelas = JobMela.query.all()
        result = []
        for j in jobmelas:
            result.append({
                "id": j.id,
                "jobmela_name": j.jobmela_name,
                "jobmela_date": j.jobmela_date,
                "jobmela_location": j.jobmela_location,
                "jobmela_partner": j.jobmela_partner,
                "created_by": get_user_info(j.created_by) if j.created_by else None,
                "updated_by": get_user_info(j.updated_by) if j.updated_by else None,
                "created_at": j.created_at,
                "updated_at": j.updated_at
            })

        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@jobmela_bp.route("/<jobmela_id>", methods=["GET"])
@jwt_required()
def get_jobmela_by_id(jobmela_id):
    """
    Get details of a single Job Mela by ID.
    """
    try:
        j = JobMela.query.filter_by(id=jobmela_id).first()
        if not j:
            return jsonify({"status": "error", "message": "Job Mela not found"}), 404

        result = {
            "id": j.id,
            "jobmela_name": j.jobmela_name,
            "jobmela_date": j.jobmela_date,
            "jobmela_location": j.jobmela_location,
            "jobmela_partner": j.jobmela_partner,
            "created_by": get_user_info(j.created_by) if j.created_by else None,
            "updated_by": get_user_info(j.updated_by) if j.updated_by else None,
            "created_at": j.created_at,
            "updated_at": j.updated_at
        }

        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@jobmela_bp.route("/<jobmela_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "placement"])
def update_jobmela(jobmela_id):
    """
    Update details of a Job Mela.
    Requires admin or placement role.
    """
    try:
        j = JobMela.query.filter_by(id=jobmela_id).first()
        if not j:
            return jsonify({"status": "error", "message": "Job Mela not found"}), 404

        data = request.get_json()

        if "jobmela_name" in data:
            j.jobmela_name = data["jobmela_name"]
        if "jobmela_date" in data:
            j.jobmela_date = datetime.fromisoformat(data["jobmela_date"])
        if "jobmela_location" in data:
            j.jobmela_location = data["jobmela_location"]
        if "jobmela_partner" in data:
            j.jobmela_partner = data["jobmela_partner"]

        j.updated_by = get_jwt_identity()
        j.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({"status": "success", "message": "Job Mela updated"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@jobmela_bp.route("/<jobmela_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "placement"])
def delete_jobmela(jobmela_id):
    """
    Delete a Job Mela.
    Requires admin or placement role.
    """
    try:
        j = JobMela.query.filter_by(id=jobmela_id).first()
        if not j:
            return jsonify({"status": "error", "message": "Job Mela not found"}), 404

        db.session.delete(j)
        db.session.commit()

        return jsonify({"status": "success", "message": "Job Mela deleted"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
