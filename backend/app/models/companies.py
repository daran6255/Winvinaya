from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from datetime import datetime
import uuid
from ..database import db

class Company(db.Model):
    __tablename__ = 'company_registration'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))    
    company_name = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False)  # e.g., Hiring, Stalls, etc.
    contact_name = Column(String(100), nullable=False)
    contact_number = Column(String(15), nullable=False)
    contact_email = Column(String(100), nullable=False)
    num_participants = Column(Integer, nullable=False)
    participants = Column(JSON, nullable=False)  # List of participant objects
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
