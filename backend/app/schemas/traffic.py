"""
Pydantic Schemas — Traffic
Request/response models for traffic data.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


class TrafficRecord(BaseModel):
    id: UUID
    timestamp: datetime
    switch_id: Optional[UUID]
    source: Optional[str]
    destination: Optional[str]
    packet_count: int
    byte_count: int
    flow_count: int
    latency: float
    jitter: float
    packet_loss: float
    throughput: float
    link_utilization: float
    cpu_usage: float
    memory_usage: float

    class Config:
        from_attributes = True


class TrafficLive(BaseModel):
    """Real-time traffic snapshot pushed via WebSocket."""
    timestamp: datetime
    total_throughput: float
    total_packets: int
    avg_latency: float
    avg_jitter: float
    packet_loss: float
    active_flows: int
    cpu_usage: float
    memory_usage: float
    switch_stats: List[dict] = []


class TrafficHistoryQuery(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    switch_id: Optional[UUID] = None
    limit: int = 100
    offset: int = 0


class TrafficHistoryResponse(BaseModel):
    records: List[TrafficRecord]
    total: int
    page: int
    per_page: int
