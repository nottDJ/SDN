"""
SQLAlchemy Model — Traffic
Stores network traffic statistics collected from switches.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    String, BigInteger, Integer, Float, DateTime, ForeignKey, func, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Traffic(Base):
    __tablename__ = "traffic"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    switch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("switches.id"), nullable=True
    )
    source: Mapped[str] = mapped_column(String(45), nullable=True)
    destination: Mapped[str] = mapped_column(String(45), nullable=True)
    packet_count: Mapped[int] = mapped_column(BigInteger, default=0)
    byte_count: Mapped[int] = mapped_column(BigInteger, default=0)
    flow_count: Mapped[int] = mapped_column(Integer, default=0)
    latency: Mapped[float] = mapped_column(Float, default=0.0)
    jitter: Mapped[float] = mapped_column(Float, default=0.0)
    packet_loss: Mapped[float] = mapped_column(Float, default=0.0)
    throughput: Mapped[float] = mapped_column(Float, default=0.0)
    link_utilization: Mapped[float] = mapped_column(Float, default=0.0)
    cpu_usage: Mapped[float] = mapped_column(Float, default=0.0)
    memory_usage: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    switch = relationship("Switch", back_populates="traffic_records")

    # Indexes for time-series queries
    __table_args__ = (
        Index("idx_traffic_timestamp_switch", "timestamp", "switch_id"),
    )

    def __repr__(self) -> str:
        return f"<Traffic(timestamp={self.timestamp}, throughput={self.throughput})>"
