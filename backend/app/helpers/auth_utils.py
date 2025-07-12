from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole

def admin_required():
    """
    Checks whether the currently logged-in user has the 'admin' role.
    Returns a JSON error if not.
    """
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Unauthorized. Token missing or invalid."
        }), 401

    user_role = UserRole.query.filter_by(user_id=user_id).first()
    if not user_role:
        return jsonify({
            "status": "error",
            "message": "Access denied. No role assigned."
        }), 403

    role = Role.query.filter_by(id=user_role.role_id).first()
    if not role or role.name.lower() != "admin":
        return jsonify({
            "status": "error",
            "message": "Access denied. Admins only."
        }), 403

    return None


def role_required(allowed_roles):
    """
    Decorator to check if the current user has one of the allowed_roles.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorated_view(*args, **kwargs):
            user_id = get_jwt_identity()
            if not user_id:
                return jsonify({
                    "status": "error",
                    "message": "Unauthorized. Token missing or invalid."
                }), 401

            user = User.query.filter_by(id=user_id, is_active=True).first()
            if not user:
                return jsonify({
                    "status": "error",
                    "message": "Invalid or inactive user."
                }), 403

            user_role = UserRole.query.filter_by(user_id=user.id).first()
            if not user_role:
                return jsonify({
                    "status": "error",
                    "message": "No role assigned."
                }), 403

            role = Role.query.filter_by(id=user_role.role_id).first()
            if not role or role.name.lower() not in [r.lower() for r in allowed_roles]:
                return jsonify({
                    "status": "error",
                    "message": f"Access denied. Only roles {allowed_roles} can perform this action."
                }), 403

            return fn(*args, **kwargs)
        return decorated_view
    return wrapper
