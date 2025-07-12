from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text
from datetime import datetime
import uuid
from ..database import db

class CandidateEvaluation(db.Model):
    __tablename__ = 'candidate_evaluation'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_profile_id = Column(String(36), ForeignKey('candidate_profile.id'), nullable=False, unique=True)

    # Post-assessment data
    skills_with_level = Column(JSON, nullable=True)  # e.g., [{"skill": "Excel", "level": "Intermediate"}]
    suitable_training = Column(String(200), nullable=True)
    comments = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)

    status = Column(String(50), nullable=False, default='Under Review')  # Options: "Selected", "Rejected", "Under Review"
    # assigned_job_role = Column(String(50), nullable=True)

    created_by = Column(String(36), ForeignKey('users.id'), nullable=False)
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
