from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
import os
from werkzeug.utils import secure_filename

from app.database import db
from app.models.post_training_skill_analysis import PostTrainingSkillAnalysis
from app.models.candidate_registration import CandidateRegistration
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

post_training_skill_bp = Blueprint("post_training_skill_bp", __name__, url_prefix="/api/v1/post-training-skills")


@post_training_skill_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "sourcing", "trainer"])
def create_post_training_skill():
    try:
        data = request.form.to_dict()
        current_user_id = get_jwt_identity()

        required_fields = ["candidate_id", "skills_with_level"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        candidate = CandidateRegistration.query.filter_by(id=data["candidate_id"]).first()
        if not candidate:
            return jsonify({
                "status": "error",
                "message": "Candidate not found."
            }), 404

        existing = PostTrainingSkillAnalysis.query.filter_by(candidate_id=data["candidate_id"]).first()
        if existing:
            return jsonify({
                "status": "error",
                "message": "Post-Training analysis already exists for this candidate."
            }), 400

        resume_path = None
        if "resume" in request.files:
            file = request.files["resume"]
            if file and file.filename != "":
                now = datetime.utcnow()
                month_year = now.strftime("%m%Y")
                folder_path = os.path.join(
                    "temp",
                    "candidate_resumes",
                    month_year
                )
                os.makedirs(folder_path, exist_ok=True)

                ext = os.path.splitext(file.filename)[-1]
                file_name = f"{candidate.name.replace(' ', '_')}_resume{ext}"
                save_path = os.path.join(folder_path, secure_filename(file_name))
                file.save(save_path)
                resume_path = save_path

        analysis = PostTrainingSkillAnalysis(
            id=str(uuid.uuid4()),
            candidate_id=data["candidate_id"],
            skills_with_level=data["skills_with_level"],
            remarks=data.get("remarks"),
            resume_path=resume_path,
            created_by=current_user_id
        )

        db.session.add(analysis)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Post-Training Skill Analysis created successfully.",
            "data": {"id": analysis.id}
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@post_training_skill_bp.route("", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing", "trainer"])
def get_all_post_training_skills():
    try:
        analyses = PostTrainingSkillAnalysis.query.all()
        result = []
        for a in analyses:
            candidate = CandidateRegistration.query.filter_by(id=a.candidate_id).first()
            user_info = get_user_info(a.created_by)
            updated_by_info = get_user_info(a.updated_by) if a.updated_by else None

            result.append({
                "id": a.id,
                "candidate_id": candidate.candidate_id if candidate else None,
                "candidate_name": candidate.name if candidate else None,
                "skills_with_level": a.skills_with_level,
                "remarks": a.remarks,
                "resume_path": a.resume_path,
                "created_by": user_info,
                "updated_by": updated_by_info,
                "created_at": a.created_at,
                "updated_at": a.updated_at
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


@post_training_skill_bp.route("/<analysis_id>", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing", "trainer"])
def get_post_training_skill_by_id(analysis_id):
    try:
        a = PostTrainingSkillAnalysis.query.filter_by(id=analysis_id).first()
        if not a:
            return jsonify({
                "status": "error",
                "message": "Post-Training analysis not found."
            }), 404

        candidate = CandidateRegistration.query.filter_by(id=a.candidate_id).first()
        user_info = get_user_info(a.created_by)
        updated_by_info = get_user_info(a.updated_by) if a.updated_by else None

        result = {
            "id": a.id,
            "candidate_id": candidate.candidate_id if candidate else None,
            "candidate_name": candidate.name if candidate else None,
            "skills_with_level": a.skills_with_level,
            "remarks": a.remarks,
            "resume_path": a.resume_path,
            "created_by": user_info,
            "updated_by": updated_by_info,
            "created_at": a.created_at,
            "updated_at": a.updated_at
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


@post_training_skill_bp.route("/<analysis_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "sourcing", "trainer"])
def update_post_training_skill(analysis_id):
    try:
        a = PostTrainingSkillAnalysis.query.filter_by(id=analysis_id).first()
        if not a:
            return jsonify({
                "status": "error",
                "message": "Post-Training analysis not found."
            }), 404

        current_user_id = get_jwt_identity()

        data = request.form.to_dict()

        # Handle JSON fields explicitly
        if "skills_with_level" in data:
            a.skills_with_level = data["skills_with_level"]
        if "remarks" in data:
            a.remarks = data["remarks"]

        # Handle resume update
        if "resume" in request.files:
            file = request.files["resume"]
            if file and file.filename != "":
                # delete previous resume if it exists
                if a.resume_path and os.path.exists(a.resume_path):
                    os.remove(a.resume_path)

                now = datetime.utcnow()
                month_year = now.strftime("%m%Y")
                folder_path = os.path.join(
                    "temp",
                    "candidate_resumes",
                    month_year
                )
                os.makedirs(folder_path, exist_ok=True)

                ext = os.path.splitext(file.filename)[-1]
                candidate = CandidateRegistration.query.filter_by(id=a.candidate_id).first()
                file_name = f"{candidate.name.replace(' ', '_')}_resume{ext}"
                save_path = os.path.join(folder_path, secure_filename(file_name))
                file.save(save_path)
                a.resume_path = save_path

        a.updated_by = current_user_id
        a.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Post-Training analysis updated successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@post_training_skill_bp.route("/<analysis_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "sourcing", "trainer"])
def delete_post_training_skill(analysis_id):
    try:
        a = PostTrainingSkillAnalysis.query.filter_by(id=analysis_id).first()
        if not a:
            return jsonify({
                "status": "error",
                "message": "Post-Training analysis not found."
            }), 404

        # Delete file if it exists
        if a.resume_path and os.path.exists(a.resume_path):
            os.remove(a.resume_path)

        db.session.delete(a)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Post-Training analysis deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
