import uuid
from app.database import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID

class ActivityLog(db.Model):
    __tablename__ = "activity_log"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    table_name = db.Column(db.String, nullable=False)
    record_id = db.Column(db.String, nullable=False)
    action = db.Column(db.String, nullable=False)
    changed_fields = db.Column(db.JSON, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "table_name": self.table_name,
            "record_id": str(self.record_id),
            "action": self.action,
            "changed_fields": self.changed_fields,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "user_id": str(self.user_id),
            "role": self.role
        }