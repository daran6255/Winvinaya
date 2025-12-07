from sqlalchemy import Column, String, DateTime, Boolean
from datetime import datetime
import uuid
from ..database import db

class User(db.Model):
    __tablename__ = 'admin_users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    verified = Column(Boolean, default=False)
    role = Column(String(50), nullable=False, default='admin')  # Default role can be 'user'
    created_at = Column(DateTime, default=datetime.utcnow)