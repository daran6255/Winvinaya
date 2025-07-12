from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from datetime import datetime
import uuid
from ..database import db

class Token(db.Model):
    __tablename__ = 'tokens'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    token = Column(String(500), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked = Column(Boolean, default=False)
    jti = Column(String(36), nullable=False, unique=True)   # <-- ADD THIS

