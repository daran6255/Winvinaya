from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime
import uuid
from ..database import db

class TrainingBatchCandidate(db.Model):
    __tablename__ = 'training_batch_candidates'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_id = Column(String(36), ForeignKey('training_batches.id'), nullable=False)
    candidate_id = Column(String(36), ForeignKey('candidate_registration.id'), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
