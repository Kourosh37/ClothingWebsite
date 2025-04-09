from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio
from datetime import datetime

class NotificationManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.notification_queue = asyncio.Queue()

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

    async def broadcast(self, message: str):
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                await connection.send_text(message)

    async def send_order_notification(self, user_id: int, order_id: int, status: str):
        notification = {
            "type": "order_update",
            "order_id": order_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(json.dumps(notification), user_id)

    async def send_system_notification(self, user_id: int, message: str):
        notification = {
            "type": "system",
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(json.dumps(notification), user_id)

manager = NotificationManager() 