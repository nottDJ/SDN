"""
SQLAlchemy Model — SystemLog
General-purpose system logging.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Enum as SAEnum, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SystemLog(Base):
    __tablename__ = "system_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    level: Mapped[str] = mapped_column(
        SAEnum("info", "warning", "error", "critical", name="log_level"),
        default="info",
    )
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)

    # Relationships
    user = relationship("User", back_populates="system_logs")

    def __repr__(self) -> str:
        return f"<SystemLog(level={self.level}, module={self.module})>"
