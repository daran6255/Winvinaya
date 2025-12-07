# models/job_map.py
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import db
from ..helpers.utils import generate_short_id
from .job_mapped import job_mapped_candidates
from .candidates import Candidate

class JobMapped(db.Model):
    __tablename__ = "job_mapped"

    id = Column(String(8), primary_key=True, default=generate_short_id)
    job_id = Column(String(8), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    job_mapped_id = Column(String, unique=True, nullable=False, default=generate_short_id)

    job = relationship("Job", backref="mapped_jobs")
    candidates = relationship("Candidate", secondary=job_mapped_candidates, backref="mapped_jobs")
