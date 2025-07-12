from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from app.database import db
from app.models.companies import Company
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

company_bp = Blueprint("company_bp", __name__, url_prefix="/api/v1/company")


@company_bp.route("", methods=["POST"])
@jwt_required()
# @role_required(["admin"])
def create_company():
    try:
        data = request.get_json()

        required_fields = [
            "company_name",
            "type",
            "contact_name",
            "contact_number",
            "contact_email",
            "num_participants",
            "participants"
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        company = Company(
            id=str(uuid.uuid4()),
            company_name=data["company_name"],
            type=data["type"],
            contact_name=data["contact_name"],
            contact_number=data["contact_number"],
            contact_email=data["contact_email"],
            num_participants=data["num_participants"],
            participants=data["participants"],
        )

        db.session.add(company)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Company created successfully.",
            "data": {"id": company.id}
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@company_bp.route("", methods=["GET"])
@jwt_required()
def get_all_companies():
    try:
        companies = Company.query.all()
        result = []
        for c in companies:
            updater_info = get_user_info(c.updated_by) if c.updated_by else None

            result.append({
                "id": c.id,
                "company_name": c.company_name,
                "type": c.type,
                "contact_name": c.contact_name,
                "contact_number": c.contact_number,
                "contact_email": c.contact_email,
                "num_participants": c.num_participants,
                "participants": c.participants,
                "updated_by": updater_info,
                "created_at": c.created_at,
                "updated_at": c.updated_at
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



@company_bp.route("/<company_id>", methods=["GET"])
@jwt_required()
def get_company_by_id(company_id):
    try:
        c = Company.query.filter_by(id=company_id).first()
        if not c:
            return jsonify({
                "status": "error",
                "message": "Company not found."
            }), 404

        updater_info = get_user_info(c.updated_by) if c.updated_by else None

        result = {
            "id": c.id,
            "company_name": c.company_name,
            "type": c.type,
            "contact_name": c.contact_name,
            "contact_number": c.contact_number,
            "contact_email": c.contact_email,
            "num_participants": c.num_participants,
            "participants": c.participants,
            "updated_by": updater_info,
            "created_at": c.created_at,
            "updated_at": c.updated_at
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


@company_bp.route("/<company_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "placement"])
def update_company(company_id):
    try:
        current_user_id = get_jwt_identity()  # ⬅️ Get user ID from JWT

        c = Company.query.filter_by(id=company_id).first()
        if not c:
            return jsonify({
                "status": "error",
                "message": "Company not found."
            }), 404

        data = request.get_json()

        for key, value in data.items():
            if hasattr(c, key):
                setattr(c, key, value)

        c.updated_by = current_user_id  # ⬅️ Store user ID
        c.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Company updated successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@company_bp.route("/<company_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_company(company_id):
    try:
        c = Company.query.filter_by(id=company_id).first()
        if not c:
            return jsonify({
                "status": "error",
                "message": "Company not found."
            }), 404

        db.session.delete(c)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Company deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
