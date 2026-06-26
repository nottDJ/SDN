"""
API Routes — Controller
SDN Controller status and management.
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/controller", tags=["Controller"])


@router.get("/status")
async def get_controller_status(current_user: User = Depends(get_current_user)):
    """Get Ryu controller status."""
    from app.services.controller_service import ControllerService
    service = ControllerService()
    return await service.get_status()


@router.post("/restart")
async def restart_controller(current_user: User = Depends(require_admin)):
    """Restart the SDN controller (admin only)."""
    return {"message": "Controller restart initiated", "status": "restarting"}


@router.get("/flows/{dpid}")
async def get_switch_flows(dpid: str, current_user: User = Depends(get_current_user)):
    """Get flow table for a specific switch."""
    from app.services.controller_service import ControllerService
    service = ControllerService()
    return await service.get_flows(dpid)


@router.get("/ports/{dpid}")
async def get_switch_ports(dpid: str, current_user: User = Depends(get_current_user)):
    """Get port statistics for a specific switch."""
    from app.services.controller_service import ControllerService
    service = ControllerService()
    return await service.get_port_stats(dpid)


@router.post("/flows")
async def install_flow(flow_data: dict, current_user: User = Depends(require_admin)):
    """Install a new flow rule on a switch (admin only)."""
    from app.services.controller_service import ControllerService
    service = ControllerService()
    return await service.install_flow(flow_data)
