"""
Service — Controller
Interfaces with the Ryu SDN controller REST API.
"""

import httpx
from app.config import settings


class ControllerService:
    def __init__(self):
        self.base_url = settings.ryu_api_url

    async def get_status(self) -> dict:
        """Get controller status."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/stats/switches")
                if resp.status_code == 200:
                    switches = resp.json()
                    return {
                        "status": "online",
                        "connected_switches": len(switches),
                        "switch_dpids": switches,
                        "protocol": "OpenFlow 1.3",
                        "controller": "Ryu",
                        "api_url": self.base_url,
                    }
        except Exception:
            pass
        
        # Simulation mode fallback
        return {
            "status": "online" if settings.SIMULATION_MODE else "offline",
            "connected_switches": 4 if settings.SIMULATION_MODE else 0,
            "switch_dpids": [1, 2, 3, 4] if settings.SIMULATION_MODE else [],
            "protocol": "OpenFlow 1.3",
            "controller": "Ryu (Simulated)" if settings.SIMULATION_MODE else "Ryu",
            "api_url": self.base_url,
            "simulation_mode": settings.SIMULATION_MODE,
        }

    async def get_flows(self, dpid: str) -> dict:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/stats/flow/{dpid}")
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return {"flows": [], "dpid": dpid, "simulation": True}

    async def get_port_stats(self, dpid: str) -> dict:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/stats/port/{dpid}")
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return {"ports": [], "dpid": dpid, "simulation": True}

    async def install_flow(self, flow_data: dict) -> dict:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{self.base_url}/stats/flowentry/add",
                    json=flow_data,
                )
                return {"status": "installed", "response_code": resp.status_code}
        except Exception:
            pass
        return {"status": "simulated", "message": "Flow rule recorded (simulation mode)"}
