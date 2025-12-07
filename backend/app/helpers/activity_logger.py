from datetime import datetime
from ..database import db
from ..models.activity_logs import ActivityLog
import json

def log_activity(table_name, record_id, action, user_id, role, changed_fields=None):
    from app import socketio
    """
    Logs user activities to the activity_log table and emits a real-time WebSocket update.
    """
    try:
        # Ensure changed_fields is a dict
        if isinstance(changed_fields, str):
            try:
                changed_fields = json.loads(changed_fields)
            except json.JSONDecodeError:
                changed_fields = {}
        elif changed_fields is None:
            changed_fields = {}

        # Normalize role
        if isinstance(role, dict) and "role" in role:
            role = role["role"]

        # Create and save activity
        activity = ActivityLog(
            table_name=table_name,
            record_id=str(record_id),
            action=action,
            changed_fields=changed_fields,
            timestamp=datetime.utcnow(),
            user_id=str(user_id),
            role=str(role)
        )
        db.session.add(activity)
        db.session.commit()

        # Emit real-time update
        print("Emitting activity_update:", activity.to_dict())
        socketio.emit("activity_update", activity.to_dict())

    except Exception as e:
        db.session.rollback()
        print(f"Error logging activity: {e}")
