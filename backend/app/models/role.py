from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid
from ..database import db

class Role(db.Model):
    __tablename__ = 'roles'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
