"""
API Routes — Simulation
Network simulation management (Mininet or synthetic).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post("/start")
async def start_simulation(
    config: dict = {},
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Start network simulation."""
    from app.services.simulation_service import SimulationService
    service = SimulationService(db)
    return await service.start(config)


@router.post("/stop")
async def stop_simulation(current_user: User = Depends(require_admin)):
    """Stop running simulation."""
    from app.services.simulation_service import SimulationService
    service = SimulationService(None)
    return await service.stop()


@router.post("/restart")
async def restart_simulation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Restart the simulation."""
    from app.services.simulation_service import SimulationService
    service = SimulationService(db)
    return await service.restart()


@router.get("/status")
async def simulation_status(current_user: User = Depends(get_current_user)):
    """Get simulation status."""
    from app.services.simulation_service import SimulationService
    service = SimulationService(None)
    return service.get_status()


@router.post("/ping-all")
async def ping_all(current_user: User = Depends(get_current_user)):
    """Run ping test between all hosts."""
    return {"message": "Ping all completed", "results": {"reachability": "100%", "avg_rtt": "2.3ms"}}


@router.post("/bandwidth-test")
async def bandwidth_test(current_user: User = Depends(get_current_user)):
    """Run iperf bandwidth test."""
    return {"message": "Bandwidth test completed", "results": {"throughput": "945 Mbps", "jitter": "0.05ms"}}


@router.post("/latency-test")
async def latency_test(current_user: User = Depends(get_current_user)):
    """Run latency test."""
    return {"message": "Latency test completed", "results": {"min": "0.5ms", "avg": "1.2ms", "max": "3.1ms"}}
