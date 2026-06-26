"""
SQLAlchemy Model — Flow
Represents an OpenFlow flow rule installed on a switch.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    String, Integer, BigInteger, DateTime, ForeignKey, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Flow(Base):
    __tablename__ = "flows"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    switch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("switches.id"), nullable=False
    )
    table_id: Mapped[int] = mapped_column(Integer, default=0)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    match_fields: Mapped[str] = mapped_column(String(500), nullable=True)
    actions: Mapped[str] = mapped_column(String(500), nullable=True)
    packet_count: Mapped[int] = mapped_column(BigInteger, default=0)
    byte_count: Mapped[int] = mapped_column(BigInteger, default=0)
    duration_sec: Mapped[int] = mapped_column(Integer, default=0)
    duration_nsec: Mapped[int] = mapped_column(Integer, default=0)
    idle_timeout: Mapped[int] = mapped_column(Integer, default=0)
    hard_timeout: Mapped[int] = mapped_column(Integer, default=0)
    cookie: Mapped[str] = mapped_column(String(20), nullable=True)
    installed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    switch = relationship("Switch", back_populates="flows")

    def __repr__(self) -> str:
        return f"<Flow(switch={self.switch_id}, priority={self.priority})>"
