"""
SQLAlchemy Model — TrainingHistory
Records each training run for ML models.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TrainingHistory(Base):
    __tablename__ = "training_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    model_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ml_models.id"), nullable=False
    )
    training_params: Mapped[dict] = mapped_column(JSON, default=dict)
    features_used: Mapped[dict] = mapped_column(JSON, default=dict)
    dataset_size: Mapped[int] = mapped_column(Integer, default=0)
    train_split: Mapped[float] = mapped_column(Float, default=0.8)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    training_loss: Mapped[dict] = mapped_column(JSON, default=dict)  # epoch -> loss
    validation_loss: Mapped[dict] = mapped_column(JSON, default=dict)
    training_time: Mapped[float] = mapped_column(Float, default=0.0)
    epochs: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="completed")
    error_message: Mapped[str] = mapped_column(String(500), nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    model = relationship("MLModel", back_populates="training_history")

    def __repr__(self) -> str:
        return f"<TrainingHistory(model_id={self.model_id}, status={self.status})>"
