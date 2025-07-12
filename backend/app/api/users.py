from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import uuid
from datetime import datetime

from app.helpers.auth_utils import admin_required
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.database import db

users_bp = Blueprint("users_bp", __name__, url_prefix="/api/v1/users")

@users_bp.route("", methods=["POST"])
@jwt_required()
def create_user():
    # Check admin
    check = admin_required()
    if check:
        return check

    try:
        data = request.get_json()

        required_fields = ["username", "email", "password", "role_name"]
        if not all(field in data for field in required_fields):
            return jsonify({
                "status": "error",
                "message": f"Missing fields. Required: {required_fields}"
            }), 400

        existing_user = User.query.filter(
            (User.username == data["username"]) | (User.email == data["email"])
        ).first()
        if existing_user:
            return jsonify({
                "status": "error",
                "message": "User with that username or email already exists."
            }), 400

        role = Role.query.filter_by(name=data["role_name"]).first()
        if not role:
            return jsonify({
                "status": "error",
                "message": f"Role '{data['role_name']}' does not exist."
            }), 404

        user = User(
            id=str(uuid.uuid4()),
            username=data["username"],
            email=data["email"],
            password_hash=generate_password_hash(data["password"]),
            is_active=True
        )
        db.session.add(user)
        db.session.flush()

        user_role = UserRole(
            id=str(uuid.uuid4()),
            user_id=user.id,
            role_id=role.id,
            assigned_at=datetime.utcnow()
        )
        db.session.add(user_role)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "User created and role assigned.",
            "data": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role.name
            }
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@users_bp.route("", methods=["GET"])
@jwt_required()
def get_all_users():
    check = admin_required()
    if check:
        return check

    try:
        users = User.query.all()
        result = []
        for user in users:
            user_role = UserRole.query.filter_by(user_id=user.id).first()
            role_name = None
            if user_role:
                role = Role.query.filter_by(id=user_role.role_id).first()
                role_name = role.name if role else None

            result.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "role": role_name
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

@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    check = admin_required()
    if check:
        return check

    try:
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found."
            }), 404

        user_role = UserRole.query.filter_by(user_id=user.id).first()
        role_name = None
        if user_role:
            role = Role.query.filter_by(id=user_role.role_id).first()
            role_name = role.name if role else None

        result = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "role": role_name
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

@users_bp.route("/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    check = admin_required()
    if check:
        return check

    try:
        data = request.get_json()
        user = User.query.filter_by(id=user_id).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found."
            }), 404

        if "username" in data:
            user.username = data["username"]

        if "email" in data:
            user.email = data["email"]

        if "password" in data:
            user.password_hash = generate_password_hash(data["password"])

        if "is_active" in data:
            user.is_active = data["is_active"]

        if "role_name" in data:
            new_role = Role.query.filter_by(name=data["role_name"]).first()
            if not new_role:
                return jsonify({
                    "status": "error",
                    "message": f"Role '{data['role_name']}' does not exist."
                }), 404

            user_role = UserRole.query.filter_by(user_id=user.id).first()
            if user_role:
                user_role.role_id = new_role.id
                user_role.assigned_at = datetime.utcnow()
                db.session.add(user_role)
            else:
                new_user_role = UserRole(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    role_id=new_role.id,
                    assigned_at=datetime.utcnow()
                )
                db.session.add(new_user_role)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "User updated successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@users_bp.route("/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    check = admin_required()
    if check:
        return check

    try:
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found."
            }), 404

        UserRole.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "User deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
