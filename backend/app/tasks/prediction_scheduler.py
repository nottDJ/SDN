"""
Background Task — Prediction Scheduler
Periodically runs predictions and generates alerts.
"""

import asyncio
import logging
from datetime import datetime, timezone

from app.database import async_session_factory
from app.services.prediction_service import PredictionService
from app.models.alert import Alert
from app.api.websocket import manager
from app.config import settings

logger = logging.getLogger(__name__)


async def prediction_loop():
    """Background loop that runs predictions every 30 seconds."""
    logger.info("Prediction scheduler started")
    await asyncio.sleep(15)  # Wait for some data to accumulate

    while True:
        try:
            async with async_session_factory() as db:
                service = PredictionService(db)
                prediction = await service.predict(model_name="auto", horizon="5min")

                if prediction.is_congestion_predicted:
                    alert = Alert(
                        severity="warning",
                        alert_type="congestion",
                        source="AI Prediction Engine",
                        message=f"Congestion predicted in next 5 minutes (utilization: {prediction.predicted_utilization:.1%})",
                        recommended_action="Rerouting traffic via alternate path",
                    )
                    db.add(alert)

                    await manager.broadcast({
                        "type": "alert",
                        "data": {
                            "severity": "warning",
                            "message": alert.message,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        },
                    })

                await db.commit()

                await manager.broadcast({
                    "type": "prediction_update",
                    "data": {
                        "model": prediction.model_name,
                        "horizon": prediction.horizon,
                        "predicted_utilization": prediction.predicted_utilization,
                        "predicted_throughput": prediction.predicted_throughput,
                        "confidence": prediction.confidence,
                        "congestion": prediction.is_congestion_predicted,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                })

        except Exception as e:
            logger.error(f"Prediction scheduler error: {e}")

        await asyncio.sleep(30)
