from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from datetime import datetime
import uuid
from ..database import db

class CandidateProfile(db.Model):
    __tablename__ = 'candidate_profile'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey('candidate_registration.id'), nullable=False, unique=True)

    # Training Info
    trained_by_winvinaya = Column(String(10), nullable=False)  # "Yes" or "No"
    training_domain = Column(String(100), nullable=True)
    training_from = Column(String(7), nullable=True)  # Format: MM/YY
    training_to = Column(String(7), nullable=True)

    # Employment Info
    employment_status = Column(String(50), nullable=False)  # "Employed" or "Unemployed"
    company_name = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    current_ctc = Column(String(50), nullable=True)
    total_experience_years = Column(Float, nullable=True)
    notice_period = Column(String(50), nullable=True)

    # Preferences
    willing_for_training = Column(String(10), nullable=True)  # Required if not trained
    ready_to_relocate = Column(String(100), nullable=True)
    intrested_training = Column(String(200), nullable=True)

    created_by = Column(String(36), ForeignKey('users.id'), nullable=False)
    updated_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
