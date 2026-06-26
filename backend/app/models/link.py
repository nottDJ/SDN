"""
SQLAlchemy Model — Link
Represents a physical or virtual link between two switches.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    String, Integer, Float, DateTime, ForeignKey, Enum as SAEnum, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Link(Base):
    __tablename__ = "links"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    src_switch: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("switches.id"), nullable=False
    )
    src_port: Mapped[int] = mapped_column(Integer, nullable=False)
    dst_switch: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("switches.id"), nullable=False
    )
    dst_port: Mapped[int] = mapped_column(Integer, nullable=False)
    bandwidth: Mapped[float] = mapped_column(Float, default=1000.0)  # Mbps
    utilization: Mapped[float] = mapped_column(Float, default=0.0)
    latency: Mapped[float] = mapped_column(Float, default=0.0)  # ms
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    status: Mapped[str] = mapped_column(
        SAEnum("up", "down", name="link_status"), default="up"
    )
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<Link(src={self.src_switch}:{self.src_port} -> dst={self.dst_switch}:{self.dst_port})>"
