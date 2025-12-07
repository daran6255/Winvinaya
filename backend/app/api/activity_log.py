from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.activity_logs import ActivityLog
from app.models.user import User  # Make sure to import your User model
from app.helpers.auth_utils import role_required

activity_bp = Blueprint("activity_bp", __name__, url_prefix="/api/v1/activities")


@activity_bp.route("", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def get_all_activities():
    try:
        logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).all()
        result = []
        for log in logs:
            username = None
            if log.user_id:
                user = User.query.get(log.user_id)
                username = user.username if user else None

            log_data = {
                "id": str(log.id),
                "table_name": log.table_name,
                "record_id": str(log.record_id),
                "action": log.action,
                "changed_fields": log.changed_fields,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "user_id": str(log.user_id),
                "role": log.role,
                "username": username
            }
            result.append(log_data)

        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500