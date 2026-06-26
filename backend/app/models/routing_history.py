"""
SQLAlchemy Model — RoutingHistory
Records routing decisions made by the AI engine.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RoutingHistory(Base):
    __tablename__ = "routing_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    source: Mapped[str] = mapped_column(String(45), nullable=False)
    destination: Mapped[str] = mapped_column(String(45), nullable=False)
    original_path: Mapped[dict] = mapped_column(JSON, default=list)
    new_path: Mapped[dict] = mapped_column(JSON, default=list)
    reason: Mapped[str] = mapped_column(String(200), nullable=False)
    algorithm_used: Mapped[str] = mapped_column(String(50), nullable=False)
    congestion_level: Mapped[float] = mapped_column(Float, default=0.0)
    improvement: Mapped[float] = mapped_column(Float, nullable=True)  # % improvement
    flow_rules_installed: Mapped[int] = mapped_column(default=0)
    success: Mapped[bool] = mapped_column(default=True)

    def __repr__(self) -> str:
        return f"<RoutingHistory(src={self.source}, dst={self.destination}, algo={self.algorithm_used})>"
