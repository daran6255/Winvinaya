# routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta
import uuid

from ..models.user import User
from ..models.role import Role
from ..models.user_role import UserRole
from ..models.token import Token
from ..database import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    # Restrict access to only admin initially
    if not user or user.email != "info@winvinaya.com":
        return jsonify({"error": "Unauthorized"}), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate token
    token_value = str(uuid.uuid4())
    token = Token(
        user_id=user.id,
        token=token_value,
        expires_at=datetime.utcnow() + timedelta(hours=4)
    )
    db.session.add(token)
    db.session.commit()

    return jsonify({
        "token": token_value,
        "expires_at": token.expires_at.isoformat()
    })
