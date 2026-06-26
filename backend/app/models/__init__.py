"""
SQLAlchemy Models — Package Init
Imports all models so Alembic and Base.metadata can discover them.
"""

from app.models.user import User
from app.models.traffic import Traffic
from app.models.prediction import Prediction
from app.models.switch import Switch
from app.models.host import Host
from app.models.flow import Flow
from app.models.link import Link
from app.models.alert import Alert
from app.models.topology import Topology
from app.models.ml_model import MLModel
from app.models.training_history import TrainingHistory
from app.models.routing_history import RoutingHistory
from app.models.system_log import SystemLog

__all__ = [
    "User",
    "Traffic",
    "Prediction",
    "Switch",
    "Host",
    "Flow",
    "Link",
    "Alert",
    "Topology",
    "MLModel",
    "TrainingHistory",
    "RoutingHistory",
    "SystemLog",
]
