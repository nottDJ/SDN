"""
Pydantic Schemas — Alert
Request/response models for alerts.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: UUID
    timestamp: datetime
    severity: str
    alert_type: str
    source: Optional[str]
    message: str
    details: Optional[str]
    recommended_action: Optional[str]
    acknowledged: bool
    resolved: bool

    class Config:
        from_attributes = True


class AlertQuery(BaseModel):
    severity: Optional[str] = None
    alert_type: Optional[str] = None
    acknowledged: Optional[bool] = None
    limit: int = 50
    offset: int = 0


class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int


class AlertAcknowledge(BaseModel):
    acknowledged_by: str
