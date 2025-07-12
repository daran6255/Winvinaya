from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from app.database import db
from app.models.candidate_interview_status import CandidateInterviewStatus
from app.models.candidate_job_mapping import CandidateJobMapping
from app.models.candidate_registration import CandidateRegistration
from app.models.jobs import Job
from app.models.companies import Company
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

candidate_interview_status_bp = Blueprint("candidate_interview_status_bp",__name__,url_prefix="/api/v1/candidate-interview-status")


@candidate_interview_status_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "placement"])
def create_interview_status():
    try:
        data = request.get_json()

        mapping_id = data.get("mapping_id")
        round_name = data.get("round_name")
        round_number = data.get("round_number")
        interview_status = data.get("interview_status", "Scheduled")
        interview_date = data.get("interview_date")
        interviewer_name = data.get("interviewer_name")
        remarks = data.get("remarks")

        if not mapping_id or not round_name:
            return jsonify({
                "status": "error",
                "message": "mapping_id and round_name are required."
            }), 400

        mapping = CandidateJobMapping.query.filter_by(id=mapping_id).first()
        if not mapping:
            return jsonify({
                "status": "error",
                "message": "Mapping not found."
            }), 404

        interview_date_dt = None
        if interview_date:
            interview_date_dt = datetime.fromisoformat(interview_date)

        current_user = get_jwt_identity()

        new_status = CandidateInterviewStatus(
            id=str(uuid.uuid4()),
            mapping_id=mapping_id,
            round_name=round_name,
            round_number=round_number,
            interview_status=interview_status,
            interview_date=interview_date_dt,
            interviewer_name=interviewer_name,
            remarks=remarks,
            created_by=current_user
        )
        db.session.add(new_status)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Interview status created.",
            "id": new_status.id
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@candidate_interview_status_bp.route("", methods=["GET"])
@jwt_required()
def get_all_interview_statuses():
    try:
        statuses = CandidateInterviewStatus.query.all()
        result = []

        for s in statuses:
            mapping = CandidateJobMapping.query.filter_by(id=s.mapping_id).first()
            candidate = CandidateRegistration.query.filter_by(id=mapping.candidate_id).first() if mapping else None
            job = Job.query.filter_by(id=mapping.job_id).first() if mapping else None
            company = Company.query.filter_by(id=job.company_id).first() if job else None

            result.append({
                "id": s.id,
                "mapping_id": s.mapping_id,
                "candidate_id": candidate.id if candidate else None,
                "candidate_name": candidate.name if candidate else None,
                "candidate_roll_number": candidate.candidate_id if candidate else None,
                "job_id": job.id if job else None,
                "job_role": job.job_role if job else None,
                "company_name": company.company_name if company else None,
                "round_name": s.round_name,
                "round_number": s.round_number,
                "interview_status": s.interview_status,
                "interview_date": s.interview_date.isoformat() if s.interview_date else None,
                "interviewer_name": s.interviewer_name,
                "remarks": s.remarks,
                "created_by": get_user_info(s.created_by),
                "updated_by": get_user_info(s.updated_by) if s.updated_by else None,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None
            })

        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@candidate_interview_status_bp.route("/<status_id>", methods=["GET"])
@jwt_required()
def get_interview_status_by_id(status_id):
    try:
        s = CandidateInterviewStatus.query.filter_by(id=status_id).first()
        if not s:
            return jsonify({"status": "error", "message": "Interview status not found."}), 404

        mapping = CandidateJobMapping.query.filter_by(id=s.mapping_id).first()
        candidate = CandidateRegistration.query.filter_by(id=mapping.candidate_id).first() if mapping else None
        job = Job.query.filter_by(id=mapping.job_id).first() if mapping else None
        company = Company.query.filter_by(id=job.company_id).first() if job else None

        result = {
            "id": s.id,
            "mapping_id": s.mapping_id,
            "candidate_id": candidate.id if candidate else None,
            "candidate_name": candidate.name if candidate else None,
            "candidate_roll_number": candidate.candidate_id if candidate else None,
            "job_id": job.id if job else None,
            "job_role": job.job_role if job else None,
            "company_name": company.company_name if company else None,
            "round_name": s.round_name,
            "round_number": s.round_number,
            "interview_status": s.interview_status,
            "interview_date": s.interview_date.isoformat() if s.interview_date else None,
            "interviewer_name": s.interviewer_name,
            "remarks": s.remarks,
            "created_by": get_user_info(s.created_by),
            "updated_by": get_user_info(s.updated_by) if s.updated_by else None,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None
        }

        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@candidate_interview_status_bp.route("/<status_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "placement"])
def update_interview_status(status_id):
    try:
        s = CandidateInterviewStatus.query.filter_by(id=status_id).first()
        if not s:
            return jsonify({"status": "error", "message": "Interview status not found."}), 404

        data = request.get_json()

        if "round_name" in data:
            s.round_name = data["round_name"]
        if "round_number" in data:
            s.round_number = data["round_number"]
        if "interview_status" in data:
            s.interview_status = data["interview_status"]
        if "interview_date" in data:
            if data["interview_date"]:
                s.interview_date = datetime.fromisoformat(data["interview_date"])
            else:
                s.interview_date = None
        if "interviewer_name" in data:
            s.interviewer_name = data["interviewer_name"]
        if "remarks" in data:
            s.remarks = data["remarks"]

        s.updated_by = get_jwt_identity()
        s.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({"status": "success", "message": "Interview status updated."}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@candidate_interview_status_bp.route("/<status_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "placement"])
def delete_interview_status(status_id):
    try:
        s = CandidateInterviewStatus.query.filter_by(id=status_id).first()
        if not s:
            return jsonify({"status": "error", "message": "Interview status not found."}), 404

        db.session.delete(s)
        db.session.commit()

        return jsonify({"status": "success", "message": "Interview status deleted."}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
