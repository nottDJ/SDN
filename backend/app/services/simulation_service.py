"""
Service — Simulation
Generates synthetic network data for demonstration without Mininet.
"""

import random
import math
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.switch import Switch
from app.models.host import Host
from app.models.link import Link
from app.models.traffic import Traffic
from app.models.alert import Alert
from app.models.topology import Topology


class SimulationService:
    _running = False
    _topology_type = "tree"

    def __init__(self, db: Optional[AsyncSession]):
        self.db = db

    async def create_topology(self, name: str, topo_type: str, config: Dict = {}, description: str = None) -> Topology:
        """Create a new topology and populate switches, hosts, links."""
        topology = Topology(name=name, topo_type=topo_type, config=config, description=description, is_active=True)
        self.db.add(topology)
        await self.db.flush()

        # Generate switches and hosts based on topology type
        switch_count = config.get("switches", 4)
        hosts_per_switch = config.get("hosts_per_switch", 2)
        switches = []

        for i in range(1, switch_count + 1):
            sw = Switch(dpid=str(i), name=f"Switch-{i}", ip_address=f"10.0.0.{i}", port_count=hosts_per_switch + 2, status="active")
            self.db.add(sw)
            await self.db.flush()
            switches.append(sw)

            for j in range(1, hosts_per_switch + 1):
                host_num = (i - 1) * hosts_per_switch + j
                host = Host(
                    mac_address=f"00:00:00:00:{i:02d}:{j:02d}",
                    ip_address=f"10.0.{i}.{j}",
                    hostname=f"h{host_num}",
                    connected_switch=sw.id,
                    connected_port=j,
                )
                self.db.add(host)

        # Create links between switches
        if topo_type == "linear":
            for i in range(len(switches) - 1):
                link = Link(
                    src_switch=switches[i].id, src_port=hosts_per_switch + 1,
                    dst_switch=switches[i + 1].id, dst_port=hosts_per_switch + 2,
                    bandwidth=1000.0, status="up",
                )
                self.db.add(link)
        elif topo_type in ("tree", "custom"):
            # Create mesh-like connections
            for i in range(len(switches)):
                for j in range(i + 1, min(i + 3, len(switches))):
                    link = Link(
                        src_switch=switches[i].id, src_port=hosts_per_switch + 1 + j,
                        dst_switch=switches[j].id, dst_port=hosts_per_switch + 1 + i,
                        bandwidth=1000.0, status="up",
                    )
                    self.db.add(link)

        topology.switch_count = switch_count
        topology.host_count = switch_count * hosts_per_switch
        await self.db.flush()
        return topology

    async def generate_traffic_data(self) -> dict:
        """Generate one round of synthetic traffic data."""
        t = datetime.now(timezone.utc).timestamp()
        base_throughput = 500 + 200 * math.sin(t / 300) + random.gauss(0, 30)
        
        data = {
            "timestamp": datetime.now(timezone.utc),
            "packet_count": random.randint(10000, 50000),
            "byte_count": random.randint(5000000, 25000000),
            "flow_count": random.randint(20, 100),
            "latency": max(0.1, 2.0 + math.sin(t / 200) + random.gauss(0, 0.5)),
            "jitter": max(0.01, 0.3 + random.gauss(0, 0.1)),
            "packet_loss": max(0, min(5, 0.1 + random.gauss(0, 0.2))),
            "throughput": max(0, base_throughput),
            "link_utilization": max(0, min(1, 0.5 + 0.3 * math.sin(t / 300) + random.gauss(0, 0.05))),
            "cpu_usage": max(0, min(100, 35 + 15 * math.sin(t / 400) + random.gauss(0, 5))),
            "memory_usage": max(0, min(100, 45 + 10 * math.sin(t / 500) + random.gauss(0, 3))),
        }
        return data

    async def start(self, config: dict = {}) -> dict:
        SimulationService._running = True
        return {"status": "started", "mode": "simulation", "message": "Synthetic traffic generation started"}

    async def stop(self) -> dict:
        SimulationService._running = False
        return {"status": "stopped", "message": "Simulation stopped"}

    async def restart(self) -> dict:
        SimulationService._running = True
        return {"status": "restarted", "message": "Simulation restarted"}

    def get_status(self) -> dict:
        return {"running": SimulationService._running, "mode": "simulation"}
