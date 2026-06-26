"""
Background Task — Traffic Collector
Periodically collects traffic data and broadcasts via WebSocket.
"""

import asyncio
import logging
from datetime import datetime, timezone

from app.database import async_session_factory
from app.models.traffic import Traffic
from app.models.switch import Switch
from app.services.simulation_service import SimulationService
from app.api.websocket import manager
from app.config import settings

logger = logging.getLogger(__name__)


async def collect_traffic_loop():
    """Background loop that collects traffic data every PREDICTION_INTERVAL seconds."""
    logger.info("Traffic collector started")
    await asyncio.sleep(3)  # Initial delay for startup

    while True:
        try:
            async with async_session_factory() as db:
                sim_service = SimulationService(db)
                data = await sim_service.generate_traffic_data()

                # Get switches
                from sqlalchemy import select
                result = await db.execute(select(Switch).limit(1))
                switch = result.scalar_one_or_none()

                traffic = Traffic(
                    switch_id=switch.id if switch else None,
                    source="10.0.1.1",
                    destination="10.0.2.1",
                    **data,
                )
                db.add(traffic)
                await db.commit()

                # Broadcast to WebSocket clients
                ws_data = {
                    "type": "traffic_update",
                    "data": {
                        "timestamp": data["timestamp"].isoformat(),
                        "throughput": data["throughput"],
                        "latency": data["latency"],
                        "jitter": data["jitter"],
                        "packet_loss": data["packet_loss"],
                        "flow_count": data["flow_count"],
                        "link_utilization": data["link_utilization"],
                        "cpu_usage": data["cpu_usage"],
                        "memory_usage": data["memory_usage"],
                        "packet_count": data["packet_count"],
                        "byte_count": data["byte_count"],
                    },
                }
                await manager.broadcast(ws_data)

        except Exception as e:
            logger.error(f"Traffic collector error: {e}")

        await asyncio.sleep(settings.PREDICTION_INTERVAL)
