"""Automated test generation service."""

import logging
import time
import re
from typing import List, Dict
from app.services.openai_api import OpenAIAPIService
from app.services.openapi_parser import OpenAPIParserService
from app.models import (
    AutomatedTestRequest,
    AutomatedTestResponse,
    UITestRequest,
    APITestRequest,
)

logger = logging.getLogger(__name__)


class AutomatedTestGeneratorService:
    """Service for generating automated tests (UI e2e and API)."""

    def __init__(
        self, openai_api: OpenAIAPIService, openapi_parser: OpenAPIParserService
    ):
        self.openai_api = openai_api
        self.openapi_parser = openapi_parser

    def _create_ui_test_prompt(
        self, test_cases: List[str], requirements: str, framework: str = "pytest"
    ) -> str:
        """Create prompt for UI e2e test generation."""
        test_cases_text = "\n\n".join(test_cases)
        prompt = f"""Generate automated e2e UI tests in pytest format based on the following test cases and requirements.

Test Cases (Allure TestOps as Code):
{test_cases_text}

UI Requirements:
{requirements}

Framework: {framework}

Requirements:
1. Use pytest framework
2. Include proper setup and teardown
3. Use page object pattern if applicable
4. Include proper assertions
5. Handle waits and timeouts appropriately
6. Include error handling
7. Add proper test documentation

Generate complete pytest test code with:
- Imports (pytest, selenium/playwright, etc.)
- Fixtures for setup/teardown
- Test functions based on the test cases
- Proper assertions
- Error handling

Return ONLY the Python code, no explanations."""

        return prompt

    def _create_api_test_prompt(
        self,
        openapi_spec: Dict,
        base_url: str,
        auth_token: str = None,
        test_cases: List[str] = None,
        endpoints: List[str] = None,
    ) -> str:
        """Create prompt for API test generation."""
        api_endpoints = self.openapi_parser.get_endpoints(openapi_spec)
        if endpoints:
            api_endpoints = [
                ep
                for ep in api_endpoints
                if ep["path"] in endpoints or ep["operation_id"] in endpoints
            ]

        endpoints_text = "\n".join(
            [
                f"- {ep['method']} {ep['path']}: {ep.get('summary', 'No summary')}"
                for ep in api_endpoints
            ]
        )

        test_cases_text = ""
        if test_cases:
            test_cases_text = "\n\nTest Cases:\n" + "\n\n".join(test_cases)

        auth_section = ""
        if auth_token:
            auth_section = f"""
Authentication:
- Type: Bearer Token
- Token: {auth_token[:20]}... (truncated)
"""

        prompt = f"""Generate automated API tests in pytest format based on the following OpenAPI specification.

API Base URL: {base_url}
{auth_section}
Endpoints to test:
{endpoints_text}
{test_cases_text}

Requirements:
1. Use pytest framework
2. Use requests or httpx library for HTTP calls
3. Include proper authentication headers
4. Test all CRUD operations
5. Include positive and negative test cases
6. Validate response status codes
7. Validate response schemas
8. Include proper error handling
9. Use fixtures for setup (base URL, auth headers, etc.)

Generate complete pytest test code with:
- Imports (pytest, requests/httpx, json, etc.)
- Fixtures for base URL and authentication
- Test functions for each endpoint
- Proper assertions for status codes and response data
- Error handling

Return ONLY the Python code, no explanations."""

        return prompt

    async def generate_ui_tests(self, request: UITestRequest) -> AutomatedTestResponse:
        """
        Generate UI e2e automated tests.

        Args:
            request: UI test generation request

        Returns:
            Generated automated test response
        """
        start_time = time.time()
        try:
            prompt = self._create_ui_test_prompt(
                test_cases=request.test_cases,
                requirements=request.requirements,
                framework=request.framework,
            )
            system_prompt = """You are an expert QA automation engineer specializing in e2e UI testing. 
You write clean, maintainable test code following best practices and design patterns."""
            generated_code = await self.openai_api.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=4000,
            )
            # Clean generated code
            generated_code = self._clean_generated_code(generated_code)
            # Count test functions
            test_count = len(re.findall(r"def\s+test_\w+", generated_code))
            # Extract dependencies
            dependencies = self._extract_dependencies(generated_code, request.framework)
            generation_time = time.time() - start_time

            return AutomatedTestResponse(
                test_code=generated_code,
                test_count=test_count,
                framework=request.framework,
                dependencies=dependencies,
                generation_time=generation_time,
                model_used="Cloud.ru OpenAI Foundation Model",
            )
        except Exception as e:
            logger.error(f"Error generating UI tests: {e}")
            raise

    async def generate_api_tests(
        self, request: APITestRequest
    ) -> AutomatedTestResponse:
        """
        Generate API automated tests.

        Args:
            request: API test generation request

        Returns:
            Generated automated test response
        """
        start_time = time.time()
        try:
            # Parse OpenAPI spec
            format = (
                "yaml"
                if request.openapi_spec.strip().startswith("---")
                or "openapi:" in request.openapi_spec
                else "json"
            )
            openapi_spec = self.openapi_parser.parse(
                request.openapi_spec, format=format
            )
            prompt = self._create_api_test_prompt(
                openapi_spec=openapi_spec,
                base_url=request.base_url,
                auth_token=request.auth_token,
                test_cases=request.test_cases,
                endpoints=request.endpoints,
            )
            system_prompt = """You are an expert QA automation engineer specializing in API testing. 
You write comprehensive API tests that validate both positive and negative scenarios, response schemas, and error handling."""
            generated_code = await self.openai_api.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=4000,
            )

            # Clean generated code
            generated_code = self._clean_generated_code(generated_code)
            # Count test functions
            test_count = len(re.findall(r"def\s+test_\w+", generated_code))
            # Extract dependencies
            dependencies = self._extract_dependencies(generated_code, "pytest")
            generation_time = time.time() - start_time

            return AutomatedTestResponse(
                test_code=generated_code,
                test_count=test_count,
                framework="pytest",
                dependencies=dependencies,
                generation_time=generation_time,
                model_used="Cloud.ru OpenAI Foundation Model",
            )
        except Exception as e:
            logger.error(f"Error generating API tests: {e}")
            raise

    async def generate_automated_tests(
        self, request: AutomatedTestRequest
    ) -> AutomatedTestResponse:
        """
        Generate automated tests based on request type.

        Args:
            request: Automated test generation request

        Returns:
            Generated automated test response
        """
        if request.test_type == "UI":
            if not request.ui_request:
                raise ValueError("UI request is required for UI test generation")
            return await self.generate_ui_tests(request.ui_request)
        elif request.test_type == "API":
            if not request.api_request:
                raise ValueError("API request is required for API test generation")
            return await self.generate_api_tests(request.api_request)
        else:
            raise ValueError(f"Unsupported test type: {request.test_type}")

    def _clean_generated_code(self, code: str) -> str:
        """Clean generated code from markdown formatting."""
        # Remove markdown code blocks
        code = re.sub(r"```python\n?", "", code)
        code = re.sub(r"```\n?", "", code)
        code = code.strip()
        return code

    def _extract_dependencies(self, code: str, framework: str) -> List[str]:
        """Extract required dependencies from generated code."""
        dependencies = ["pytest"]
        if "selenium" in code.lower() or "webdriver" in code.lower():
            dependencies.append("selenium")
        if "playwright" in code.lower():
            dependencies.append("playwright")
        if "requests" in code.lower():
            dependencies.append("requests")
        if "httpx" in code.lower():
            dependencies.append("httpx")
        if "allure" in code.lower():
            dependencies.append("allure-pytest")
        return dependencies
