"""
API Routes — Training
ML model training management with CSV upload support.
"""

import io
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/training", tags=["Training"])


@router.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin),
):
    """Upload a CSV dataset for training."""
    if not file.filename.endswith(".csv"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    
    content = await file.read()
    import pandas as pd
    df = pd.read_csv(io.BytesIO(content))
    
    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "sample": df.head(5).to_dict(orient="records"),
    }


@router.get("/history")
async def get_training_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get training run history."""
    from sqlalchemy import select, desc
    from app.models.training_history import TrainingHistory
    
    result = await db.execute(select(TrainingHistory).order_by(desc(TrainingHistory.started_at)).limit(20))
    runs = result.scalars().all()
    
    return [
        {
            "id": str(r.id),
            "model_id": str(r.model_id),
            "dataset_size": r.dataset_size,
            "metrics": r.metrics,
            "training_time": r.training_time,
            "epochs": r.epochs,
            "status": r.status,
            "started_at": r.started_at.isoformat() if r.started_at else None,
        }
        for r in runs
    ]
