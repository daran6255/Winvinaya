from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey
from datetime import datetime
import uuid
from ..helpers.utils import generate_candidate_id
from ..database import db


class CandidateRegistration(db.Model):
    __tablename__ = 'candidate_registration'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(20), unique=True, nullable=False, default=generate_candidate_id)
    
    name = Column(String(100), nullable=False)
    gender = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    phone = Column(String(15), nullable=False)
    guardian_name = Column(String(100), nullable=False)
    guardian_phone = Column(String(15), nullable=False)
    city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    degree = Column(String(100), nullable=False)
    branch = Column(String(100), nullable=False)
    disability_type = Column(String(100), nullable=False)
    disability_percentage = Column(Integer, nullable=False)
    skills = Column(JSON, nullable=True)
    experience_type = Column(String(20), nullable=False)  # "Fresher" or "Experienced"
    disability_certificate_path = Column(String(500), nullable=True)

    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
