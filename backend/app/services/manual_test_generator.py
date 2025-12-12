"""Test case generation service."""

import re
import logging
import time
from typing import List
from app.models import (
    TestCase,
    GenerateManualTestCaseRequest,
    TestCaseStep,
    Priority,
    GenerateBatchTestCaseRequest,
    GenerateManualTestCaseResponse,
)
from app.services.openai_api import OpenAIAPIService
from app.utils.exceptions import TestGenerationError

logger = logging.getLogger(__name__)


class ManualTestCaseGeneratorService:
    """Service for generating manual test cases in Allure TestOps as Code format."""

    __test__ = False

    def __init__(self, openai_api: OpenAIAPIService):
        self.openai_api = openai_api

    def _create_generation_prompt(
        self,
        requirements: str,
        test_type: str,
        feature: str,
        story: str,
        owner: str,
        priority: Priority,
        jira_link: str = None,
        jira_name: str = None,
    ) -> str:
        """Create prompt for test case generation."""
        prompt = f"""Generate a manual test case in Allure TestOps as Code format (Python) based on the following requirements.

Requirements:
{requirements}

Test Type: {test_type}
Feature: {feature}
Story: {story}
Owner: {owner}
Priority: {priority.value}
"""
        if jira_link:
            prompt += f"JIRA Link: {jira_link}\n"
        if jira_name:
            prompt += f"JIRA Name: {jira_name}\n"

        prompt += f"""
The test case must:
1. Follow AAA pattern (Arrange-Act-Assert)
2. Use proper Allure decorators:
   - @allure.manual
   - @allure.label("owner", owner)
   - @allure.feature(feature)
   - @allure.story(story)
   - @allure.suite(test_type)
   - @pytest.mark.manual
   - @allure.title(test_title)
   - @allure.description(test_description)
   - @allure.tag(priority)
   - @allure.label("priority", priority)
3. Include proper class structure with test methods considering the requirements and test type
4. Use allure.step context manager for each step with expected results
5. Include arrange, act, and assert sections clearly

Generate the complete Python code with no explanations following this format:

@allure.manual
@allure.label("owner", owner)
@allure.feature(feature)
@allure.story(story)
@allure.suite(test_type)
@pytest.mark.manual
class TestFeature:
    @allure.title(test_title)
    @allure.description(test_description")
    @allure.link(jira_link, name=jira_name)  
    @allure.tag(priority)
    @allure.label("priority", priority)
    def test_method(self) -> None:
        # Arrange section
        with allure.step("Arrange step description"):
            pass
        
        # Act section
        with allure.step("Act step description"):
            pass
        
        # Assert section
        with allure.step("Assert step description"):
            pass
"""

        return prompt

    def _parse_generated_code(
        self, code: str, request: GenerateManualTestCaseRequest
    ) -> TestCase:
        """Parse generated code and extract test case structure."""
        # Extract test title
        title_match = re.search(r'@allure\.title\(["\'](.+?)["\']\)', code)
        title = title_match.group(1) if title_match else "Generated Test Case"

        # Extract function name
        func_match = re.search(r"def\s+(\w+)\s*\(", code)
        function_name = func_match.group(1) if func_match else "test_generated"

        # Extract steps
        steps = []
        step_matches = re.finditer(r'with\s+allure.step\(["\'](.+?)["\']\)', code)
        for idx, match in enumerate(step_matches, 1):
            step_desc = match.group(1)
            # Try to determine if it's arrange, act, or assert
            step_type = "action"
            if "arrange" in step_desc.lower() or "setup" in step_desc.lower():
                step_type = "arrange"
            elif "act" in step_desc.lower() or "execute" in step_desc.lower():
                step_type = "act"
            elif "assert" in step_desc.lower() or "verify" in step_desc.lower():
                step_type = "assert"

            steps.append(
                TestCaseStep(
                    step_number=idx,
                    description=step_desc,
                    action=step_type,
                    expected_result=f"Expected result for: {step_desc}",
                )
            )

        # Extract arrange, act, assert sections
        arrange_section = self._extract_section(code, "arrange")
        act_section = self._extract_section(code, "act")
        assert_section = self._extract_section(code, "assert")

        return TestCase(
            title=title,
            function_name=function_name,
            feature=request.feature,
            story=request.story,
            owner=request.owner,
            priority=request.priority,
            test_type=request.test_type,
            suite=request.test_type,
            jira_link=request.jira_link,
            jira_name=request.jira_name,
            steps=steps,
            arrange_section=arrange_section,
            act_section=act_section,
            assert_section=assert_section,
            code=code,
        )

    def _extract_section(self, code: str, section_type: str) -> str:
        """Extract specific section from code."""
        pattern = (
            rf"#\s*{section_type.capitalize()}\s+section.*?(?=#\s*(?:Act|Assert|$))"
        )
        match = re.search(pattern, code, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(0).strip()
        return f"# {section_type.capitalize()} section"

    async def generate(
        self, request: GenerateManualTestCaseRequest
    ) -> GenerateManualTestCaseResponse:
        """
        Generate a single test case.

        Args:
            request: Test case generation request

        Returns:
            Generated test case response
        """
        start_time = time.time()

        try:
            prompt = self._create_generation_prompt(
                requirements=request.requirements,
                test_type=request.test_type,
                feature=request.feature,
                story=request.story,
                owner=request.owner,
                priority=request.priority,
                jira_link=request.jira_link,
                jira_name=request.jira_name,
            )
            system_prompt = """You are an expert QA engineer specializing in writing test cases in Allure TestOps as Code format. 
You always follow the AAA (Arrange-Act-Assert) pattern and ensure all Allure decorators are correctly applied."""
            generated_code = await self.openai_api.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=10000,
            )

            # Clean up the code (remove markdown code blocks if present)
            generated_code = self._clean_generated_code(generated_code)

            # Parse the generated code
            test_case = self._parse_generated_code(generated_code, request)
            test_case.code = generated_code  # Use cleaned code
            generation_time = time.time() - start_time

            return GenerateManualTestCaseResponse(
                test_case=test_case,
                generation_time=generation_time,
                model_used=self.openai_api.model,
            )

        except Exception as e:
            logger.error(f"Error generating test case: {e}")
            raise TestGenerationError("Failed to generate manual test case")

    async def generate_batch(
        self, request: GenerateBatchTestCaseRequest
    ) -> List[GenerateManualTestCaseResponse]:
        """
        Generate multiple test cases.

        Args:
            request: Batch test case generation request

        Returns:
            List of generated test case responses
        """
        results = []

        for i in range(request.count):
            test_request = GenerateManualTestCaseRequest(
                requirements=request.requirements,
                test_type=request.test_type,
                feature=request.feature,
                story=request.story,
                owner=request.owner,
                priority=Priority.NORMAL,
            )

            result = await self.generate(test_request)
            results.append(result)

        return results

    def _clean_generated_code(self, code: str) -> str:
        """Clean generated code from markdown formatting."""
        # Remove markdown code blocks
        code = re.sub(r"```python\n?", "", code)
        code = re.sub(r"```\n?", "", code)
        code = code.strip()

        # Ensure imports are present
        if "import allure" not in code:
            code = (
                "import allure\nfrom allure_commons.test import allure_step\nimport pytest\n\n"
                + code
            )

        return code
