"""
Service — Report
Generates downloadable PDF, CSV, and Excel reports.
"""

import os
import uuid as uuid_mod
import csv
import io
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.traffic import Traffic
from app.models.prediction import Prediction
from app.models.routing_history import RoutingHistory
from app.schemas.report import ReportResponse


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        os.makedirs("reports", exist_ok=True)

    async def generate(self, report_type: str, format: str, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None, sections: List[str] = []) -> ReportResponse:
        report_id = str(uuid_mod.uuid4())[:8]
        filename = f"sdn_report_{report_id}.{format}"
        filepath = os.path.join("reports", filename)

        if format == "csv":
            await self._generate_csv(filepath, start_time, end_time)
        elif format == "excel":
            filename = f"sdn_report_{report_id}.xlsx"
            filepath = os.path.join("reports", filename)
            await self._generate_excel(filepath, start_time, end_time)
        else:
            await self._generate_pdf(filepath, start_time, end_time, sections)

        size = os.path.getsize(filepath) if os.path.exists(filepath) else 0
        return ReportResponse(
            report_id=report_id, filename=filename, format=format,
            generated_at=datetime.now(timezone.utc),
            download_url=f"/reports/download/{filename}", size_bytes=size,
        )

    async def _generate_csv(self, filepath: str, start_time, end_time):
        result = await self.db.execute(select(Traffic).order_by(desc(Traffic.timestamp)).limit(1000))
        records = result.scalars().all()
        with open(filepath, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["timestamp", "throughput", "latency", "packet_loss", "utilization", "cpu", "memory"])
            for r in records:
                writer.writerow([r.timestamp, r.throughput, r.latency, r.packet_loss, r.link_utilization, r.cpu_usage, r.memory_usage])

    async def _generate_excel(self, filepath: str, start_time, end_time):
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Traffic Summary"
        ws.append(["Timestamp", "Throughput", "Latency", "Packet Loss", "Utilization"])
        result = await self.db.execute(select(Traffic).order_by(desc(Traffic.timestamp)).limit(1000))
        for r in result.scalars().all():
            ws.append([str(r.timestamp), r.throughput, r.latency, r.packet_loss, r.link_utilization])
        wb.save(filepath)

    async def _generate_pdf(self, filepath: str, start_time, end_time, sections):
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas as pdf_canvas
        c = pdf_canvas.Canvas(filepath, pagesize=letter)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(50, 750, "SDN Traffic Management Report")
        c.setFont("Helvetica", 12)
        c.drawString(50, 720, f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
        c.drawString(50, 700, f"Sections: {', '.join(sections)}")
        y = 660
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Traffic Summary")
        y -= 20
        c.setFont("Helvetica", 10)
        result = await self.db.execute(select(Traffic).order_by(desc(Traffic.timestamp)).limit(20))
        for r in result.scalars().all():
            if y < 50:
                c.showPage()
                y = 750
            c.drawString(50, y, f"{r.timestamp} | Throughput: {r.throughput:.1f} | Latency: {r.latency:.2f}ms | Loss: {r.packet_loss:.2f}%")
            y -= 15
        c.save()
