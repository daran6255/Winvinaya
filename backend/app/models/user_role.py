from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime
import uuid
from ..database import db

class UserRole(db.Model):
    __tablename__ = 'user_roles'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    role_id = Column(String(36), ForeignKey('roles.id'), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
