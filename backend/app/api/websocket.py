"""
WebSocket Manager & Routes
Real-time data streaming to connected dashboard clients.
"""

import json
import asyncio
from typing import List
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manages WebSocket connections for broadcasting real-time data."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for conn in dead:
            self.disconnect(conn)

    async def send_personal(self, websocket: WebSocket, message: dict):
        await websocket.send_json(message)


# Global connection manager
manager = ConnectionManager()


@router.websocket("/ws/traffic")
async def websocket_traffic(websocket: WebSocket):
    """WebSocket endpoint for real-time traffic data streaming."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            # Client can send commands like {"action": "subscribe", "channel": "traffic"}
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await manager.send_personal(websocket, {"action": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """WebSocket endpoint for real-time alert notifications."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
