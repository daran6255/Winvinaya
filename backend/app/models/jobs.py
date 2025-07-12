from sqlalchemy import Column, String, Integer, Text, Float, ForeignKey, JSON, DateTime
from datetime import datetime
import uuid
from ..database import db

class Job(db.Model):
    __tablename__ = 'jobs'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey('company_registration.id'), nullable=False)  
    job_role = Column(String(100), nullable=False)
    skills = Column(JSON, nullable=False)  # e.g., ["Python", "SQL"]
    experience_level = Column(String(50), nullable=False)
    education_qualification = Column(JSON, nullable=False)  # e.g., ["B.Tech", "M.Sc"]
    num_openings = Column(Integer, nullable=False)
    location = Column(String(100), nullable=False)
    disability_preferred = Column(String(100), nullable=True)
    approx_salary = Column(Float, nullable=True)
    roles_and_responsibilities = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    job_status = Column(String(50), nullable=False, default='Open')  # e.g., Open, Closed, Paused
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
