from sqlalchemy import Column, String, DateTime, ForeignKey
from datetime import datetime
import uuid
from ..database import db

class CandidateJobMapping(db.Model):
    __tablename__ = 'candidate_job_mapping'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey('candidate_registration.id'), nullable=False)
    job_id = Column(String(36), ForeignKey('jobs.id'), nullable=False)

    mapping_status = Column(String(50), nullable=False, default="Mapped")  
    # Examples: "Mapped", "Applied", "Shortlisted", "Rejected", "Selected"
    
    created_by = Column(String(36), ForeignKey('users.id'), nullable=False)
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
