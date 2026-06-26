"""
SQLAlchemy Model — Topology
Stores network topology configurations.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Topology(Base):
    __tablename__ = "topologies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    topo_type: Mapped[str] = mapped_column(
        SAEnum("single_switch", "linear", "tree", "custom", name="topology_type"),
        nullable=False,
    )
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    switch_count: Mapped[int] = mapped_column(default=0)
    host_count: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<Topology(name={self.name}, type={self.topo_type})>"
