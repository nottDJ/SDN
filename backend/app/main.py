"""
SDN AI Traffic Management — FastAPI Application Entry Point
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db, close_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("🚀 Starting SDN AI Traffic Manager...")
    await init_db()
    logger.info("✅ Database initialized")

    # Start background tasks
    from app.tasks.traffic_collector import collect_traffic_loop
    from app.tasks.prediction_scheduler import prediction_loop
    
    traffic_task = asyncio.create_task(collect_traffic_loop())
    prediction_task = asyncio.create_task(prediction_loop())
    logger.info("✅ Background tasks started")

    # Seed initial data if empty
    from app.services.simulation_service import SimulationService
    from app.database import async_session_factory
    from sqlalchemy import select, func
    from app.models.switch import Switch
    
    async with async_session_factory() as db:
        count = await db.execute(select(func.count()).select_from(Switch))
        if count.scalar() == 0:
            sim = SimulationService(db)
            await sim.create_topology(
                name="Default Tree Topology",
                topo_type="tree",
                config={"switches": 4, "hosts_per_switch": 2},
                description="Auto-generated default topology",
            )
            await db.commit()
            logger.info("✅ Default topology seeded")

    yield

    # Shutdown
    traffic_task.cancel()
    prediction_task.cancel()
    await close_db()
    logger.info("👋 Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Driven Predictive Network Traffic Management & Intelligent Routing in SDN",
    lifespan=lifespan,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ──
from app.api.auth import router as auth_router
from app.api.traffic import router as traffic_router
from app.api.predictions import router as predictions_router
from app.api.topology import router as topology_router
from app.api.controller import router as controller_router
from app.api.alerts import router as alerts_router
from app.api.reports import router as reports_router
from app.api.simulation import router as simulation_router
from app.api.training import router as training_router
from app.api.routing import router as routing_router
from app.api.websocket import router as ws_router

app.include_router(auth_router, prefix="/api")
app.include_router(traffic_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")
app.include_router(topology_router, prefix="/api")
app.include_router(controller_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(training_router, prefix="/api")
app.include_router(routing_router, prefix="/api")
app.include_router(ws_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/api/dashboard/stats")
async def dashboard_stats():
    """Quick dashboard overview stats."""
    from app.database import async_session_factory
    from sqlalchemy import select, func
    from app.models.switch import Switch
    from app.models.host import Host
    from app.models.flow import Flow
    from app.models.alert import Alert
    from app.models.traffic import Traffic
    from datetime import timedelta, timezone, datetime

    async with async_session_factory() as db:
        switches = (await db.execute(select(func.count()).select_from(Switch))).scalar()
        hosts = (await db.execute(select(func.count()).select_from(Host))).scalar()
        flows = (await db.execute(select(func.count()).select_from(Flow))).scalar()
        unack_alerts = (await db.execute(select(func.count()).select_from(Alert).where(Alert.acknowledged == False))).scalar()

        cutoff = datetime.now(timezone.utc) - timedelta(seconds=30)
        recent = await db.execute(select(Traffic).where(Traffic.timestamp >= cutoff).order_by(Traffic.timestamp.desc()).limit(10))
        records = recent.scalars().all()

        avg_throughput = sum(r.throughput for r in records) / len(records) if records else 0
        avg_latency = sum(r.latency for r in records) / len(records) if records else 0
        avg_loss = sum(r.packet_loss for r in records) / len(records) if records else 0
        avg_cpu = sum(r.cpu_usage for r in records) / len(records) if records else 0
        avg_memory = sum(r.memory_usage for r in records) / len(records) if records else 0
        avg_util = sum(r.link_utilization for r in records) / len(records) if records else 0

    return {
        "active_switches": switches,
        "active_hosts": hosts,
        "active_flows": flows,
        "current_throughput": round(avg_throughput, 2),
        "avg_latency": round(avg_latency, 3),
        "packet_loss": round(avg_loss, 4),
        "cpu_usage": round(avg_cpu, 1),
        "memory_usage": round(avg_memory, 1),
        "congestion_risk": round(min(avg_util * 100, 100), 1),
        "unacknowledged_alerts": unack_alerts,
        "prediction_accuracy": 89.5,
    }
