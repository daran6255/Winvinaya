from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from datetime import datetime
from ..database import db
from ..helpers.utils import generate_short_id

class Sourcing(db.Model):
    __tablename__ = 'sourcing'

    id = Column(String(8), primary_key=True, default=generate_short_id)
    candidate_id = Column(String(8), ForeignKey('candidates.id'), nullable=False)
    trained_by_winvinaya = Column(String(10), nullable=False)  # Yes/No

    # For candidates trained by WinVinaya
    batch_id = Column(String(50), nullable=True)
    domain = Column(String(50), nullable=True)   # ITFS, ITST, etc.
    duration_from_month = Column(Integer, nullable=True)
    duration_from_year = Column(Integer, nullable=True)
    duration_to_month = Column(Integer, nullable=True)
    duration_to_year = Column(Integer, nullable=True)

    # For candidates not trained yet
    willing_for_training = Column(String(10), nullable=True)  # Yes/No

    # Common
    skills = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # relationship
    candidate = db.relationship('Candidate', backref='winvinaya_training', uselist=False)
