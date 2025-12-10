"""Service for analyzing historical defect data."""

import logging
from typing import List
from app.services.openai_api import OpenAIAPIService
from app.models import (
    AnalyzeDefectRequest,
    AnalyzeDefectResponse,
    DefectHotspot,
    DefectRecord,
)

logger = logging.getLogger(__name__)


class DefectAnalyzerService:
    """Analyze historical defects to surface hotspots and recommendations."""

    def __init__(self, openai_api: OpenAIAPIService):
        self.openai_api = openai_api

    async def analyze(self, request: AnalyzeDefectRequest) -> AnalyzeDefectResponse:
        prompt = self._build_prompt(request.defects, request.requirements)
        system_prompt = (
            "You are a QA lead specializing in risk-based testing. "
            "Identify hotspots, risk areas, and actionable test ideas from defects."
        )
        analysis = await self.openai_api.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.35,
            max_tokens=1400,
        )
        hotspots = self._parse_hotspots(analysis)

        return AnalyzeDefectResponse(
            hotspots=hotspots,
            summary=analysis,
            model_used=self.openai_api.model,
        )

    def _build_prompt(
        self, defects: List[DefectRecord], requirements: str | None
    ) -> str:
        defect_lines = []
        for d in defects:
            line = (
                f"- {d.id or 'N/A'} | {d.title} | severity: {d.severity or 'N/A'} "
                f"| area: {d.area or d.component or 'N/A'} | tags: {', '.join(d.tags) if d.tags else 'none'}"
            )
            defect_lines.append(line)

        req_text = requirements or "No requirements provided."
        return (
            "Analyze the historical defects and highlight hotspots and risks.\n"
            "Provide 3-7 hotspots with priority and clear recommendations.\n"
            "Format as bullet points. Keep concise.\n\n"
            "Requirements (current scope):\n"
            f"{req_text}\n\n"
            "Defects:\n"
            "\n".join(defect_lines)
        )

    def _parse_hotspots(self, analysis: str) -> List[DefectHotspot]:
        hotspots: List[DefectHotspot] = []
        for line in analysis.splitlines():
            if not line.startswith("-"):
                continue
            text = line.lstrip("- ").strip()
            parts = text.split("|")
            area = parts[0].strip() if parts else "Area"
            risk = parts[1].strip() if len(parts) > 1 else "Risk"
            recommendation = parts[2].strip() if len(parts) > 2 else "Add tests"
            priority = parts[3].strip() if len(parts) > 3 else "HIGH"
            hotspots.append(
                DefectHotspot(
                    area=area,
                    risk=risk,
                    recommendation=recommendation,
                    priority=priority,
                )
            )
        return hotspots
