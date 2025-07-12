from sqlalchemy import Column, String
import uuid
from ..database import db

class Permission(db.Model):
    __tablename__ = 'permissions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255))
