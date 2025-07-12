from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from app.database import db
from app.models.jobs import Job
from app.models.companies import Company
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

jobs_bp = Blueprint("jobs_bp", __name__, url_prefix="/api/v1/jobs")


@jobs_bp.route("", methods=["POST"])
@jwt_required()
def create_job():
    try:
        data = request.get_json()

        required_fields = [
            "company_id",
            "job_role",
            "skills",
            "experience_level",
            "education_qualification",
            "num_openings",
            "location",
            "roles_and_responsibilities",
            "description",
            "job_status"
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        # Check company exists
        company = Company.query.filter_by(id=data["company_id"]).first()
        if not company:
            return jsonify({
                "status": "error",
                "message": "Company not found."
            }), 404

        job = Job(
            id=str(uuid.uuid4()),
            company_id=data["company_id"],
            job_role=data["job_role"],
            skills=data["skills"],
            experience_level=data["experience_level"],
            education_qualification=data["education_qualification"],
            num_openings=data["num_openings"],
            location=data["location"],
            disability_preferred=data.get("disability_preferred"),
            approx_salary=data.get("approx_salary"),
            roles_and_responsibilities=data["roles_and_responsibilities"],
            description=data["description"],
            job_status=data["job_status"]
        )

        db.session.add(job)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Job created successfully.",
            "data": {"id": job.id}
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@jobs_bp.route("", methods=["GET"])
@jwt_required()
def get_all_jobs():
    try:
        jobs = Job.query.all()
        result = []
        for j in jobs:
            updater_info = get_user_info(j.updated_by) if j.updated_by else None

            result.append({
                "id": j.id,
                "company_id": j.company_id,
                "job_role": j.job_role,
                "skills": j.skills,
                "experience_level": j.experience_level,
                "education_qualification": j.education_qualification,
                "num_openings": j.num_openings,
                "location": j.location,
                "disability_preferred": j.disability_preferred,
                "approx_salary": j.approx_salary,
                "roles_and_responsibilities": j.roles_and_responsibilities,
                "description": j.description,
                "job_status": j.job_status,
                "updated_by": updater_info,
                "created_at": j.created_at,
                "updated_at": j.updated_at
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


@jobs_bp.route("/<job_id>", methods=["GET"])
@jwt_required()
def get_job_by_id(job_id):
    try:
        j = Job.query.filter_by(id=job_id).first()
        if not j:
            return jsonify({
                "status": "error",
                "message": "Job not found."
            }), 404

        updater_info = get_user_info(j.updated_by) if j.updated_by else None

        result = {
            "id": j.id,
            "company_id": j.company_id,
            "job_role": j.job_role,
            "skills": j.skills,
            "experience_level": j.experience_level,
            "education_qualification": j.education_qualification,
            "num_openings": j.num_openings,
            "location": j.location,
            "disability_preferred": j.disability_preferred,
            "approx_salary": j.approx_salary,
            "roles_and_responsibilities": j.roles_and_responsibilities,
            "description": j.description,
            "job_status": j.job_status,
            "updated_by": updater_info,
            "created_at": j.created_at,
            "updated_at": j.updated_at
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


@jobs_bp.route("/<job_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "placement"])
def update_job(job_id):
    try:
        j = Job.query.filter_by(id=job_id).first()
        if not j:
            return jsonify({
                "status": "error",
                "message": "Job not found."
            }), 404

        current_user_id = get_jwt_identity()

        data = request.get_json()
        for key, value in data.items():
            if hasattr(j, key):
                setattr(j, key, value)

        j.updated_by = current_user_id
        j.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Job updated successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@jobs_bp.route("/<job_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "placement"])
def delete_job(job_id):
    try:
        j = Job.query.filter_by(id=job_id).first()
        if not j:
            return jsonify({
                "status": "error",
                "message": "Job not found."
            }), 404

        db.session.delete(j)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Job deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
