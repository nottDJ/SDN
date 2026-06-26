"""
Network — Routing Engine
Implements Dijkstra, load-balanced, and congestion-aware routing algorithms.
"""

import heapq
from typing import List, Dict, Tuple, Optional
import networkx as nx


class RoutingEngine:
    def __init__(self):
        self.graph = nx.Graph()

    def build_graph(self, switches: list, links: list):
        """Build network graph from switch and link data."""
        self.graph.clear()
        for sw in switches:
            self.graph.add_node(sw["dpid"], **sw)
        for link in links:
            self.graph.add_edge(
                link["src"], link["dst"],
                bandwidth=link.get("bandwidth", 1000),
                utilization=link.get("utilization", 0),
                latency=link.get("latency", 1),
                weight=link.get("weight", 1),
                status=link.get("status", "up"),
            )

    def shortest_path(self, source: str, destination: str) -> Optional[List[str]]:
        """Dijkstra's shortest path."""
        try:
            return nx.shortest_path(self.graph, source, destination, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def weighted_path(self, source: str, destination: str) -> Optional[List[str]]:
        """Load-balanced routing using utilization-weighted edges."""
        # Create weight based on utilization
        for u, v, data in self.graph.edges(data=True):
            data["lb_weight"] = 1 + data.get("utilization", 0) * 10
        try:
            return nx.shortest_path(self.graph, source, destination, weight="lb_weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def congestion_aware_path(self, source: str, destination: str, threshold: float = 0.8) -> Optional[List[str]]:
        """Find path avoiding congested links (utilization > threshold)."""
        # Build subgraph excluding congested links
        non_congested = nx.Graph()
        for u, v, data in self.graph.edges(data=True):
            if data.get("utilization", 0) < threshold and data.get("status") == "up":
                non_congested.add_edge(u, v, **data)
        try:
            return nx.shortest_path(non_congested, source, destination, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            # Fallback to weighted path if no non-congested path exists
            return self.weighted_path(source, destination)

    def get_all_paths(self, source: str, destination: str, max_paths: int = 5) -> List[List[str]]:
        """Get all simple paths between source and destination."""
        try:
            paths = list(nx.all_simple_paths(self.graph, source, destination, cutoff=10))
            return sorted(paths, key=len)[:max_paths]
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def get_backup_path(self, source: str, destination: str, primary_path: List[str]) -> Optional[List[str]]:
        """Find a backup path that avoids edges in the primary path."""
        temp_graph = self.graph.copy()
        for i in range(len(primary_path) - 1):
            if temp_graph.has_edge(primary_path[i], primary_path[i + 1]):
                temp_graph.remove_edge(primary_path[i], primary_path[i + 1])
        try:
            return nx.shortest_path(temp_graph, source, destination, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def calculate_path_cost(self, path: List[str]) -> Dict:
        """Calculate total cost metrics for a path."""
        total_latency = 0
        total_hops = len(path) - 1
        min_bandwidth = float("inf")
        max_utilization = 0
        
        for i in range(len(path) - 1):
            if self.graph.has_edge(path[i], path[i + 1]):
                edge = self.graph[path[i]][path[i + 1]]
                total_latency += edge.get("latency", 1)
                min_bandwidth = min(min_bandwidth, edge.get("bandwidth", 1000))
                max_utilization = max(max_utilization, edge.get("utilization", 0))
        
        return {
            "hops": total_hops,
            "total_latency": round(total_latency, 3),
            "bottleneck_bandwidth": min_bandwidth,
            "max_utilization": round(max_utilization, 4),
            "path": path,
        }
