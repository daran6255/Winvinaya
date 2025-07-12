from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text
from datetime import datetime
import uuid
from ..database import db

class PostTrainingSkillAnalysis(db.Model):
    __tablename__ = 'post_training_skill_analysis'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey('candidate_registration.id'), nullable=False, unique=True)

    skills_with_level = Column(JSON, nullable=False)
    remarks = Column(Text, nullable=True)
    resume_path = Column(String(255), nullable=True)

    created_by = Column(String(36), ForeignKey('users.id'), nullable=False)
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
