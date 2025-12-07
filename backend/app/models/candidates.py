from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from datetime import datetime
from ..database import db
from ..helpers.utils import generate_short_id

class Candidate(db.Model):
    __tablename__ = 'candidates'

    id = Column(String(8), primary_key=True, default=generate_short_id)
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

    trained_by_winvinaya = Column(String(10), nullable=False)  # "Yes" or "No"

    skills = Column(JSON, nullable=True)

    experience_type = Column(String(20), nullable=False)  # "Fresher" or "Experienced"
    years_of_experience = Column(Integer, nullable=True)
    current_status = Column(String(100), nullable=True)
    previous_position = Column(String(100), nullable=True)

    ready_to_relocate = Column(String(10), nullable=False)

    resume_path = Column(String(500), nullable=True)
    disability_certificate_path = Column(String(500), nullable=True)

    jobmela_id = Column(String(36), ForeignKey('jobmela.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    jobmela_id = db.Column(String(36), db.ForeignKey("jobmela.id"))
    jobmela = db.relationship("JobMela", back_populates="candidates")

