"""
API Routes — Predictions
ML model predictions and training management.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.prediction import Prediction
from app.models.ml_model import MLModel
from app.models.user import User
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    TrainRequest,
    TrainResponse,
    PredictionHistoryResponse,
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse)
async def run_prediction(
    request: PredictionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run AI prediction with the specified model and horizon."""
    from app.services.prediction_service import PredictionService
    
    service = PredictionService(db)
    prediction = await service.predict(
        model_name=request.model_name,
        horizon=request.horizon,
        features=request.features,
    )
    return PredictionResponse.model_validate(prediction)


@router.post("/train", response_model=TrainResponse)
async def train_model(
    request: TrainRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Train a new ML model (admin only)."""
    from app.services.prediction_service import PredictionService
    
    service = PredictionService(db)
    result = await service.train_model(
        algorithm=request.algorithm,
        features=request.features,
        hyperparameters=request.hyperparameters,
        train_split=request.train_split,
        epochs=request.epochs,
    )
    return result


@router.get("/history", response_model=PredictionHistoryResponse)
async def get_prediction_history(
    model_name: Optional[str] = None,
    limit: int = Query(default=50, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get historical predictions."""
    query = select(Prediction)
    if model_name:
        query = query.where(Prediction.model_name == model_name)

    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()

    query = query.order_by(desc(Prediction.timestamp)).offset(offset).limit(limit)
    result = await db.execute(query)
    predictions = result.scalars().all()

    return PredictionHistoryResponse(
        predictions=[PredictionResponse.model_validate(p) for p in predictions],
        total=total,
    )


@router.get("/models")
async def list_models(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all trained ML models with their metrics."""
    result = await db.execute(
        select(MLModel).order_by(desc(MLModel.trained_at))
    )
    models = result.scalars().all()

    return [
        {
            "id": str(m.id),
            "name": m.name,
            "algorithm": m.algorithm,
            "version": m.version,
            "accuracy": m.accuracy,
            "rmse": m.rmse,
            "mae": m.mae,
            "training_time": m.training_time,
            "prediction_time": m.prediction_time,
            "is_active": m.is_active,
            "metrics": m.metrics,
            "feature_importance": m.feature_importance,
            "hyperparameters": m.hyperparameters,
            "trained_at": m.trained_at.isoformat() if m.trained_at else None,
        }
        for m in models
    ]


@router.post("/models/{model_id}/activate")
async def activate_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Set a model as the active prediction model (admin only)."""
    from uuid import UUID
    
    # Deactivate all models
    result = await db.execute(select(MLModel))
    all_models = result.scalars().all()
    for m in all_models:
        m.is_active = False

    # Activate the selected model
    result = await db.execute(
        select(MLModel).where(MLModel.id == UUID(model_id))
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    model.is_active = True
    return {"message": f"Model '{model.name}' activated", "model_id": model_id}
