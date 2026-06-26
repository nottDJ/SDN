"""
SQLAlchemy Model — MLModel
Stores metadata about trained ML models.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Float, DateTime, Enum as SAEnum, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MLModel(Base):
    __tablename__ = "ml_models"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    algorithm: Mapped[str] = mapped_column(
        SAEnum(
            "random_forest", "xgboost", "lstm", "gru",
            name="ml_algorithm"
        ),
        nullable=False,
    )
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    file_path: Mapped[str] = mapped_column(String(500), nullable=True)
    hyperparameters: Mapped[dict] = mapped_column(JSON, default=dict)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    feature_importance: Mapped[dict] = mapped_column(JSON, default=dict)
    accuracy: Mapped[float] = mapped_column(Float, nullable=True)
    rmse: Mapped[float] = mapped_column(Float, nullable=True)
    mae: Mapped[float] = mapped_column(Float, nullable=True)
    training_time: Mapped[float] = mapped_column(Float, nullable=True)  # seconds
    prediction_time: Mapped[float] = mapped_column(Float, nullable=True)  # ms
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    trained_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    training_history = relationship(
        "TrainingHistory", back_populates="model", lazy="dynamic"
    )

    def __repr__(self) -> str:
        return f"<MLModel(name={self.name}, algorithm={self.algorithm})>"
