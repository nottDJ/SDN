"""
Pydantic Schemas — Topology
Request/response models for network topology.
"""

from datetime import datetime
from typing import Optional, List, Dict
from uuid import UUID

from pydantic import BaseModel


class SwitchResponse(BaseModel):
    id: UUID
    dpid: str
    name: Optional[str]
    ip_address: Optional[str]
    port_count: int
    status: str
    last_seen: datetime

    class Config:
        from_attributes = True


class HostResponse(BaseModel):
    id: UUID
    mac_address: str
    ip_address: Optional[str]
    hostname: Optional[str]
    connected_switch: Optional[UUID]
    connected_port: Optional[int]

    class Config:
        from_attributes = True


class LinkResponse(BaseModel):
    id: UUID
    src_switch: UUID
    src_port: int
    dst_switch: UUID
    dst_port: int
    bandwidth: float
    utilization: float
    latency: float
    status: str

    class Config:
        from_attributes = True


class TopologyNode(BaseModel):
    """Node in the topology graph for frontend rendering."""
    id: str
    type: str  # host, switch, controller
    label: str
    status: str = "normal"
    metrics: Optional[Dict] = None
    position: Optional[Dict] = None


class TopologyEdge(BaseModel):
    """Edge in the topology graph for frontend rendering."""
    id: str
    source: str
    target: str
    animated: bool = False
    utilization: float = 0.0
    bandwidth: float = 0.0
    label: Optional[str] = None


class TopologyResponse(BaseModel):
    nodes: List[TopologyNode]
    edges: List[TopologyEdge]
    metadata: Dict = {}


class TopologyCreate(BaseModel):
    name: str
    topo_type: str  # single_switch, linear, tree, custom
    config: Dict = {}
    description: Optional[str] = None


class TopologyConfigResponse(BaseModel):
    id: UUID
    name: str
    topo_type: str
    config: Dict
    switch_count: int
    host_count: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
