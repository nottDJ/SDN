"""
API Routes — Traffic
Live and historical network traffic data.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.traffic import Traffic
from app.models.user import User
from app.schemas.traffic import TrafficRecord, TrafficHistoryResponse, TrafficLive

router = APIRouter(prefix="/traffic", tags=["Traffic"])


@router.get("/live", response_model=TrafficLive)
async def get_live_traffic(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get real-time traffic snapshot (latest aggregated data)."""
    # Get the latest traffic records (last 10 seconds)
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=10)
    result = await db.execute(
        select(Traffic)
        .where(Traffic.timestamp >= cutoff)
        .order_by(desc(Traffic.timestamp))
        .limit(50)
    )
    records = result.scalars().all()

    if not records:
        return TrafficLive(
            timestamp=datetime.now(timezone.utc),
            total_throughput=0.0,
            total_packets=0,
            avg_latency=0.0,
            avg_jitter=0.0,
            packet_loss=0.0,
            active_flows=0,
            cpu_usage=0.0,
            memory_usage=0.0,
        )

    # Aggregate
    total_throughput = sum(r.throughput for r in records)
    total_packets = sum(r.packet_count for r in records)
    avg_latency = sum(r.latency for r in records) / len(records)
    avg_jitter = sum(r.jitter for r in records) / len(records)
    avg_packet_loss = sum(r.packet_loss for r in records) / len(records)
    total_flows = sum(r.flow_count for r in records)
    avg_cpu = sum(r.cpu_usage for r in records) / len(records)
    avg_memory = sum(r.memory_usage for r in records) / len(records)

    return TrafficLive(
        timestamp=records[0].timestamp,
        total_throughput=round(total_throughput, 2),
        total_packets=total_packets,
        avg_latency=round(avg_latency, 3),
        avg_jitter=round(avg_jitter, 3),
        packet_loss=round(avg_packet_loss, 4),
        active_flows=total_flows,
        cpu_usage=round(avg_cpu, 1),
        memory_usage=round(avg_memory, 1),
    )


@router.get("/history", response_model=TrafficHistoryResponse)
async def get_traffic_history(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    switch_id: Optional[UUID] = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get historical traffic data with filters."""
    query = select(Traffic)

    if start_time:
        query = query.where(Traffic.timestamp >= start_time)
    if end_time:
        query = query.where(Traffic.timestamp <= end_time)
    if switch_id:
        query = query.where(Traffic.switch_id == switch_id)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Fetch page
    query = query.order_by(desc(Traffic.timestamp)).offset(offset).limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()

    return TrafficHistoryResponse(
        records=[TrafficRecord.model_validate(r) for r in records],
        total=total,
        page=offset // limit + 1,
        per_page=limit,
    )


@router.get("/stats")
async def get_traffic_stats(
    hours: int = Query(default=24, le=168),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregated traffic statistics for the specified time window."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    result = await db.execute(
        select(
            func.avg(Traffic.throughput).label("avg_throughput"),
            func.max(Traffic.throughput).label("max_throughput"),
            func.avg(Traffic.latency).label("avg_latency"),
            func.avg(Traffic.packet_loss).label("avg_packet_loss"),
            func.sum(Traffic.packet_count).label("total_packets"),
            func.sum(Traffic.byte_count).label("total_bytes"),
            func.avg(Traffic.cpu_usage).label("avg_cpu"),
            func.avg(Traffic.memory_usage).label("avg_memory"),
            func.count().label("record_count"),
        ).where(Traffic.timestamp >= cutoff)
    )
    stats = result.one()

    return {
        "time_window_hours": hours,
        "avg_throughput": round(stats.avg_throughput or 0, 2),
        "max_throughput": round(stats.max_throughput or 0, 2),
        "avg_latency": round(stats.avg_latency or 0, 3),
        "avg_packet_loss": round(stats.avg_packet_loss or 0, 4),
        "total_packets": stats.total_packets or 0,
        "total_bytes": stats.total_bytes or 0,
        "avg_cpu": round(stats.avg_cpu or 0, 1),
        "avg_memory": round(stats.avg_memory or 0, 1),
        "record_count": stats.record_count,
    }
