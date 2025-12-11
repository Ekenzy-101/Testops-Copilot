"""Service for generating test plans."""

import logging
from typing import List
from app.services.openai_api import OpenAIAPIService
from app.models.test_plan import GenerateTestPlanRequest, GenerateTestPlanResponse

logger = logging.getLogger(__name__)


class TestPlanGeneratorService:
    """Generate a concise, actionable test plan."""

    __test__ = False

    def __init__(self, openai_api: OpenAIAPIService):
        self.openai_api = openai_api

    async def generate(
        self, request: GenerateTestPlanRequest
    ) -> GenerateTestPlanResponse:
        """Generate a test plan using the LLM."""
        prompt = self._build_prompt(request)
        system_prompt = (
            "You are a senior QA test manager. "
            "Produce concise, actionable test plans with clear sections and priorities."
        )

        plan = await self.openai_api.generate(
            prompt=prompt, system_prompt=system_prompt, temperature=0.4, max_tokens=1800
        )
        sections = self._extract_sections(plan)

        return GenerateTestPlanResponse(
            plan=plan,
            sections=sections,
            model_used=self.openai_api.model,
        )

    def _build_prompt(self, req: GenerateTestPlanRequest) -> str:
        goals = "\n".join(f"- {g}" for g in req.goals)
        return (
            f"Create a structured test plan.\n\n"
            f"Product: {req.product}\n"
            f"Goals:\n{goals}\n"
            f"Scope:\n{req.scope}\n"
            f"Out of Scope:\n{req.out_of_scope or 'None'}\n"
            f"Risks:\n{req.risks or 'None'}\n"
            f"Environments:\n{req.environments or 'Default'}\n"
            f"Timelines:\n{req.timelines or 'Not specified'}\n\n"
            "Include sections: Objectives, Scope, Approach, Environments, "
            "Entry/Exit Criteria, Risks & Mitigations, Milestones, Reporting. "
            "Use bullets where helpful. Keep it concise."
        )

    def _extract_sections(self, plan: str) -> List[str]:
        sections: List[str] = []
        for line in plan.splitlines():
            if line.strip().endswith(":"):
                sections.append(line.strip(":").strip())
        return sections or ["Objectives", "Scope", "Approach"]
