from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime

from app.database import db
from app.models.candidate_job_mapping import CandidateJobMapping
from app.models.candidate_registration import CandidateRegistration
from app.models.post_training_skill_analysis import PostTrainingSkillAnalysis
from app.models.jobs import Job
from app.models.companies import Company
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info
from app.helpers.matching_utils import (
    get_all_jobs,
    get_all_candidates_with_skills,
    find_exact_matches,
    find_close_matches,
)

candidate_job_mapping_bp = Blueprint("candidate_job_mapping_bp",__name__,url_prefix="/api/v1/candidate-job-mapping",)


@candidate_job_mapping_bp.route("/matchings", methods=["GET"])
@jwt_required()
def get_job_candidate_matchings():
    try:
        all_jobs = get_all_jobs()
        candidates_with_skills = get_all_candidates_with_skills()

        result = []

        for job in all_jobs:
            company = Company.query.filter_by(id=job.company_id).first()

            job_skills = [s.lower() for s in job.skills] if job.skills else []
            # ✅ DEBUG
            # print(f"[DEBUG] Job: {job.job_role}, Skills: {job_skills}") 

            job_data = {
                "id": job.id,
                "job_role": job.job_role,
                "company_id": job.company_id,
                "skills": job_skills,
            }

            exact_matches = find_exact_matches(job_data, candidates_with_skills)
            exclude_ids = [c.id for c in exact_matches]
            close_matches = find_close_matches(job_data, candidates_with_skills, exclude_ids=exclude_ids)

            result.append({
                "job_id": job.id,
                "job_role": job.job_role,
                "company_name": company.company_name if company else None,
                "exact_match": [
                    {
                        "id": c.id,
                        "candidate_id": c.candidate_id,
                        "candidate_name": c.name,
                    }
                    for c in exact_matches
                ],
                "close_match": [
                    {
                        "candidate_id": c.id,
                        "candidate_name": c.name,
                    }
                    for c in close_matches
                ]
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


@candidate_job_mapping_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "placement"])
def map_candidate_to_job():
    try:
        data = request.get_json()
        candidate_id = data.get("candidate_id")
        job_id = data.get("job_id")

        if not candidate_id or not job_id:
            return jsonify({
                "status": "error",
                "message": "candidate_id and job_id are required."
            }), 400

        current_user_id = get_jwt_identity()

        # Check candidate exists
        candidate = CandidateRegistration.query.filter_by(id=candidate_id).first()
        if not candidate:
            return jsonify({
                "status": "error",
                "message": "Candidate not found."
            }), 404

        # Check job exists
        job = Job.query.filter_by(id=job_id).first()
        if not job:
            return jsonify({
                "status": "error",
                "message": "Job not found."
            }), 404

        # Check if mapping already exists
        existing = CandidateJobMapping.query.filter_by(
            candidate_id=candidate_id,
            job_id=job_id
        ).first()
        if existing:
            return jsonify({
                "status": "error",
                "message": "Mapping already exists."
            }), 400

        # Create mapping
        mapping = CandidateJobMapping(
            id=str(uuid.uuid4()),
            candidate_id=candidate_id,
            job_id=job_id,
            mapping_status="Mapped",
            created_by=current_user_id,
        )
        db.session.add(mapping)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Candidate mapped to job.",
            "mapping_id": mapping.id
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@candidate_job_mapping_bp.route("", methods=["GET"])
@jwt_required()
def get_all_mappings():
    try:
        mappings = CandidateJobMapping.query.all()
        job_map = {}

        for m in mappings:
            job = Job.query.filter_by(id=m.job_id).first()
            candidate = CandidateRegistration.query.filter_by(id=m.candidate_id).first()
            company = Company.query.filter_by(id=job.company_id).first() if job else None

            if not job or not candidate:
                continue

            # Fetch candidate's skills from PostTrainingSkillAnalysis
            analysis = PostTrainingSkillAnalysis.query.filter_by(candidate_id=candidate.id).first()
            candidate_skills = {}
            if analysis and analysis.skills_with_level:
                candidate_skills = analysis.skills_with_level
            else:
                candidate_skills = {}

            job_key = job.id

            if job_key not in job_map:
                job_map[job_key] = {
                    "job_id": job.id,
                    "job_role": job.job_role,
                    "company_name": company.company_name if company else None,
                    "skills": job.skills if job.skills else [],
                    "candidates": []
                }

            job_map[job_key]["candidates"].append({
                "candidate_id": candidate.id,
                "candidate_name": candidate.name,
                "candidate_roll_number": candidate.candidate_id,
                "mapping_status": m.mapping_status,
                "skills": candidate_skills
            })

        result = list(job_map.values())

        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@candidate_job_mapping_bp.route("/<mapping_id>", methods=["GET"])
@jwt_required()
def get_mapping_by_id(mapping_id):
    try:
        m = CandidateJobMapping.query.filter_by(id=mapping_id).first()
        if not m:
            return jsonify({"status": "error", "message": "Mapping not found"}), 404

        candidate = CandidateRegistration.query.filter_by(id=m.candidate_id).first()
        job = Job.query.filter_by(id=m.job_id).first()
        company = Company.query.filter_by(id=job.company_id).first() if job else None

        # Get candidate skill analysis
        analysis = PostTrainingSkillAnalysis.query.filter_by(candidate_id=candidate.id).first()
        candidate_skills = analysis.skills_with_level if analysis and analysis.skills_with_level else {}

        result = {
            "id": m.id,
            "candidate_id": candidate.id if candidate else None,
            "candidate_name": candidate.name if candidate else None,
            "candidate_roll_number": candidate.candidate_id if candidate else None,
            "job_id": job.id if job else None,
            "job_role": job.job_role if job else None,
            "company_name": company.company_name if company else None,
            "job_skills": job.skills if job and job.skills else [],
            "candidate_skills": candidate_skills,
            "mapping_status": m.mapping_status,
            "created_by": get_user_info(m.created_by) if m.created_by else None,
            "updated_by": get_user_info(m.updated_by) if m.updated_by else None,
            "created_at": m.created_at,
            "updated_at": m.updated_at
        }

        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@candidate_job_mapping_bp.route("/<mapping_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "placement"])
def update_mapping(mapping_id):
    try:
        m = CandidateJobMapping.query.filter_by(id=mapping_id).first()
        if not m:
            return jsonify({"status": "error", "message": "Mapping not found"}), 404

        data = request.get_json()

        if "mapping_status" in data:
            m.mapping_status = data["mapping_status"]

        m.updated_by = get_jwt_identity()
        m.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({"status": "success", "message": "Mapping updated"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@candidate_job_mapping_bp.route("/<mapping_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "placement"])
def delete_mapping(mapping_id):
    try:
        m = CandidateJobMapping.query.filter_by(id=mapping_id).first()
        if not m:
            return jsonify({"status": "error", "message": "Mapping not found"}), 404

        db.session.delete(m)
        db.session.commit()

        return jsonify({"status": "success", "message": "Mapping deleted"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
