"""
Pydantic Schemas — Prediction
Request/response models for ML predictions.
"""

from datetime import datetime
from typing import Optional, List, Dict
from uuid import UUID

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    model_name: str = "random_forest"
    horizon: str = "5min"  # 5min, 10min, 30min
    features: Optional[Dict] = None


class PredictionResponse(BaseModel):
    id: UUID
    timestamp: datetime
    model_name: str
    horizon: str
    predicted_throughput: Optional[float]
    predicted_latency: Optional[float]
    predicted_utilization: Optional[float]
    predicted_packet_loss: Optional[float]
    confidence: float
    is_congestion_predicted: bool
    action_taken: Optional[str]

    class Config:
        from_attributes = True


class TrainRequest(BaseModel):
    algorithm: str  # random_forest, xgboost, lstm, gru
    features: List[str] = [
        "packet_count", "byte_count", "flow_count", "latency",
        "jitter", "packet_loss", "throughput", "link_utilization"
    ]
    hyperparameters: Optional[Dict] = None
    train_split: float = 0.8
    epochs: Optional[int] = 50  # For LSTM/GRU


class TrainResponse(BaseModel):
    model_id: UUID
    model_name: str
    algorithm: str
    metrics: Dict
    feature_importance: Dict
    training_time: float
    status: str


class ModelMetrics(BaseModel):
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    rmse: Optional[float]
    mae: Optional[float]
    r2_score: Optional[float]
    training_time: Optional[float]
    prediction_time: Optional[float]


class ModelComparison(BaseModel):
    models: List[Dict]


class PredictionHistoryResponse(BaseModel):
    predictions: List[PredictionResponse]
    total: int
