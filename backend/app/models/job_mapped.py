# models/job_mapped.py
from sqlalchemy import Table, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from ..database import db

job_mapped_candidates = Table(
    'job_mapped_candidates',
    db.Model.metadata,
    Column('job_mapped_id', String(8), ForeignKey('job_mapped.id', ondelete="CASCADE"), primary_key=True),
    Column('candidate_id', String(8), ForeignKey('candidates.id', ondelete="CASCADE"), primary_key=True)
)
