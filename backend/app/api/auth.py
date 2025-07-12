import uuid
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    get_jti
)
from app.database import db
from app.models.user import User
from app.models.token import Token
from app.models.user_role import UserRole
from app.models.role import Role

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/v1/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data or "email" not in data or "password" not in data:
            return jsonify({
                "status": "error",
                "message": "Email and password are required"
            }), 400

        email = data["email"]
        password = data["password"]

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if not check_password_hash(user.password_hash, password):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        user_role = UserRole.query.filter_by(user_id=user.id).first()
        role_name = None
        if user_role:
            role = Role.query.filter_by(id=user_role.role_id).first()
            role_name = role.name if role else None

        # Token expiry
        expires_delta = timedelta(hours=8)
        expires_at = datetime.utcnow() + expires_delta

        # Create JWT token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=expires_delta
        )

        # Extract JTI
        jti = get_jti(access_token)

        # Save token in DB
        token_obj = Token(
            id=str(uuid.uuid4()),
            user_id=user.id,
            token=access_token,
            expires_at=expires_at,
            revoked=False,
            jti=jti
        )
        db.session.add(token_obj)
        db.session.commit()

        response = {
            "status": "success",
            "message": "Login successful",
            "data": {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": role_name
                },
                "access_token": access_token
            }
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]

        # Find token record by JTI
        token_record = Token.query.filter_by(jti=jti).first()

        if token_record:
            token_record.revoked = True
            db.session.commit()

        return jsonify({
            "status": "success",
            "message": "User logged out successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@auth_bp.route("/verify-token", methods=["GET"])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Token is valid",
            "data": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500