"""
SQLAlchemy Model — Host
Represents a host device connected to a switch.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Host(Base):
    __tablename__ = "hosts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mac_address: Mapped[str] = mapped_column(
        String(17), unique=True, nullable=False, index=True
    )
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    hostname: Mapped[str] = mapped_column(String(100), nullable=True)
    connected_switch: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("switches.id"), nullable=True
    )
    connected_port: Mapped[int] = mapped_column(Integer, nullable=True)
    vlan_id: Mapped[int] = mapped_column(Integer, nullable=True)
    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    connected_switch_rel = relationship("Switch", back_populates="connected_hosts")

    def __repr__(self) -> str:
        return f"<Host(mac={self.mac_address}, ip={self.ip_address})>"
