"""
API Routes — Reports
Generate downloadable reports in PDF, CSV, and Excel formats.
"""

import os
import uuid as uuid_mod
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.report import ReportRequest, ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a downloadable report."""
    from app.services.report_service import ReportService
    service = ReportService(db)
    report = await service.generate(
        report_type=request.report_type,
        format=request.format,
        start_time=request.start_time,
        end_time=request.end_time,
        sections=request.include_sections,
    )
    return report


@router.get("/download/{filename}")
async def download_report(filename: str, current_user: User = Depends(get_current_user)):
    """Download a generated report file."""
    filepath = os.path.join("reports", filename)
    if not os.path.exists(filepath):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(filepath, filename=filename)
