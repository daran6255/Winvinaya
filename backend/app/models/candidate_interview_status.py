from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
from ..database import db

class CandidateInterviewStatus(db.Model):
    __tablename__ = 'candidate_interview_status'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    mapping_id = Column(String(36), ForeignKey('candidate_job_mapping.id'), nullable=False)
    # Instead of separate candidate_id and job_id

    round_name = Column(String(100), nullable=False)  # e.g. "HR", "Technical"
    round_number = Column(String(20), nullable=True)  # e.g. "1", "2"

    interview_status = Column(String(50), nullable=False, default="Scheduled")
    # Options: Scheduled, Attended, Cleared, Rejected, No Show

    interview_date = Column(DateTime, nullable=True)
    interviewer_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)

    created_by = Column(String(36), ForeignKey('users.id'), nullable=False)
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
