"""
Pydantic Schemas — Report
Request/response models for report generation.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class ReportRequest(BaseModel):
    report_type: str = "traffic_summary"  # traffic_summary, prediction_accuracy, congestion_events, etc.
    format: str = "pdf"  # pdf, csv, excel
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    include_sections: List[str] = [
        "traffic_summary",
        "prediction_accuracy",
        "congestion_events",
        "flow_statistics",
        "bandwidth_utilization",
        "top_talkers",
        "routing_changes",
    ]


class ReportResponse(BaseModel):
    report_id: str
    filename: str
    format: str
    generated_at: datetime
    download_url: str
    size_bytes: int
