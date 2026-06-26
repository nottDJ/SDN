"""
API Routes — Topology
Network topology management and visualization data.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.topology import Topology
from app.models.switch import Switch
from app.models.host import Host
from app.models.link import Link
from app.models.user import User
from app.schemas.topology import (
    TopologyResponse, TopologyCreate, TopologyConfigResponse,
    TopologyNode, TopologyEdge, SwitchResponse, HostResponse, LinkResponse,
)

router = APIRouter(prefix="/topology", tags=["Topology"])


@router.get("", response_model=TopologyResponse)
async def get_topology(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    nodes, edges = [], []
    nodes.append(TopologyNode(id="controller-1", type="controller", label="SDN Controller", status="active"))
    
    result = await db.execute(select(Switch))
    switches = result.scalars().all()
    for sw in switches:
        nodes.append(TopologyNode(id=f"switch-{sw.dpid}", type="switch", label=sw.name or f"Switch {sw.dpid}", status=sw.status, metrics={"dpid": sw.dpid, "ports": sw.port_count}))
        edges.append(TopologyEdge(id=f"ctrl-sw-{sw.dpid}", source="controller-1", target=f"switch-{sw.dpid}", animated=True, label="OpenFlow"))

    result = await db.execute(select(Host))
    hosts = result.scalars().all()
    for host in hosts:
        nodes.append(TopologyNode(id=f"host-{host.mac_address}", type="host", label=host.hostname or host.ip_address or host.mac_address, status="normal"))
        if host.connected_switch:
            sw_r = await db.execute(select(Switch).where(Switch.id == host.connected_switch))
            sw = sw_r.scalar_one_or_none()
            if sw:
                edges.append(TopologyEdge(id=f"host-sw-{host.mac_address}", source=f"host-{host.mac_address}", target=f"switch-{sw.dpid}"))

    result = await db.execute(select(Link))
    links = result.scalars().all()
    for link in links:
        src_r = await db.execute(select(Switch).where(Switch.id == link.src_switch))
        dst_r = await db.execute(select(Switch).where(Switch.id == link.dst_switch))
        src_sw, dst_sw = src_r.scalar_one_or_none(), dst_r.scalar_one_or_none()
        if src_sw and dst_sw:
            edges.append(TopologyEdge(id=f"link-{link.id}", source=f"switch-{src_sw.dpid}", target=f"switch-{dst_sw.dpid}", animated=link.status == "up", utilization=link.utilization, bandwidth=link.bandwidth, label=f"{link.bandwidth}Mbps"))

    return TopologyResponse(nodes=nodes, edges=edges, metadata={"switch_count": len(switches), "host_count": len(hosts), "link_count": len(links)})


@router.post("", response_model=TopologyConfigResponse, status_code=201)
async def create_topology(data: TopologyCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    from app.services.simulation_service import SimulationService
    service = SimulationService(db)
    topology = await service.create_topology(name=data.name, topo_type=data.topo_type, config=data.config, description=data.description)
    return TopologyConfigResponse.model_validate(topology)


@router.delete("/{topology_id}")
async def delete_topology(topology_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    result = await db.execute(select(Topology).where(Topology.id == UUID(topology_id)))
    topology = result.scalar_one_or_none()
    if not topology:
        raise HTTPException(status_code=404, detail="Topology not found")
    await db.delete(topology)
    return {"message": "Topology deleted"}


@router.get("/configs")
async def list_topologies(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Topology).order_by(desc(Topology.created_at)))
    return [TopologyConfigResponse.model_validate(t) for t in result.scalars().all()]


@router.get("/switches")
async def list_switches(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Switch))
    return [SwitchResponse.model_validate(s) for s in result.scalars().all()]


@router.get("/hosts")
async def list_hosts(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Host))
    return [HostResponse.model_validate(h) for h in result.scalars().all()]


@router.get("/links")
async def list_links(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Link))
    return [LinkResponse.model_validate(l) for l in result.scalars().all()]
