"""
SQLAlchemy Model — Switch
Represents an OpenFlow switch in the SDN topology.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, Enum as SAEnum, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Switch(Base):
    __tablename__ = "switches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    dpid: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    port_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        SAEnum("active", "inactive", "error", name="switch_status"),
        default="active",
    )
    manufacturer: Mapped[str] = mapped_column(String(100), nullable=True)
    hardware: Mapped[str] = mapped_column(String(100), nullable=True)
    software: Mapped[str] = mapped_column(String(100), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    flows = relationship("Flow", back_populates="switch", lazy="dynamic")
    traffic_records = relationship("Traffic", back_populates="switch", lazy="dynamic")
    connected_hosts = relationship("Host", back_populates="connected_switch_rel", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Switch(dpid={self.dpid}, status={self.status})>"
