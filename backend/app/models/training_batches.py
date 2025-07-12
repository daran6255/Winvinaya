from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid
from ..database import db

class TrainingBatch(db.Model):
    __tablename__ = 'training_batches'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain = Column(String(100), nullable=False)
    batch_name = Column(String(100), nullable=False)
    batch_from = Column(String(7), nullable=False)  # Format: MM/YY
    batch_to = Column(String(7), nullable=False)    # Format: MM/YY

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
