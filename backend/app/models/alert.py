"""
SQLAlchemy Model — Alert
Stores network alerts and notifications.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    severity: Mapped[str] = mapped_column(
        SAEnum("info", "warning", "critical", name="alert_severity"),
        nullable=False,
    )
    alert_type: Mapped[str] = mapped_column(
        SAEnum(
            "congestion",
            "high_latency",
            "packet_loss",
            "switch_down",
            "controller_offline",
            "high_cpu",
            "bandwidth_exhaustion",
            "anomaly",
            name="alert_type",
        ),
        nullable=False,
    )
    source: Mapped[str] = mapped_column(String(100), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=True)
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_by: Mapped[str] = mapped_column(String(50), nullable=True)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    def __repr__(self) -> str:
        return f"<Alert(severity={self.severity}, type={self.alert_type})>"
