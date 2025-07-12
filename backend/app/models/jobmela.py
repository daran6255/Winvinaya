from sqlalchemy import Column, String, DateTime, ForeignKey
from datetime import datetime
import uuid
from ..database import db

class JobMela(db.Model):
    __tablename__ = 'jobmelas'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    jobmela_name = Column(String(200), nullable=False)
    jobmela_date = Column(DateTime, nullable=False)
    jobmela_location = Column(String(200), nullable=False)
    jobmela_partner = Column(String(200), nullable=False)
    
    created_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
