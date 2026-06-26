"""
SQLAlchemy Model — Prediction
Stores AI/ML prediction results for network traffic.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)
    model_version: Mapped[str] = mapped_column(String(20), nullable=True)
    horizon: Mapped[str] = mapped_column(
        String(10), nullable=False  # "5min", "10min", "30min"
    )
    predicted_throughput: Mapped[float] = mapped_column(Float, nullable=True)
    predicted_latency: Mapped[float] = mapped_column(Float, nullable=True)
    predicted_utilization: Mapped[float] = mapped_column(Float, nullable=True)
    predicted_packet_loss: Mapped[float] = mapped_column(Float, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    actual_throughput: Mapped[float] = mapped_column(Float, nullable=True)
    actual_latency: Mapped[float] = mapped_column(Float, nullable=True)
    actual_utilization: Mapped[float] = mapped_column(Float, nullable=True)
    features_used: Mapped[dict] = mapped_column(JSON, default=dict)
    is_congestion_predicted: Mapped[bool] = mapped_column(default=False)
    action_taken: Mapped[str] = mapped_column(String(200), nullable=True)

    def __repr__(self) -> str:
        return f"<Prediction(model={self.model_name}, horizon={self.horizon}, congestion={self.is_congestion_predicted})>"
