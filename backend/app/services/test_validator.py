"""Test case validation service."""

import json
import re
import logging
from typing import List
from app.services.openai_api import OpenAIAPIService
from app.models import (
    ValidateTestCaseRequest,
    ValidateTestCaseResponse,
    ValidationResult,
    ValidationIssue,
    IssueSeverity,
)

logger = logging.getLogger(__name__)


class TestValidatorService:
    """Service for validating test cases against Allure standards."""

    __test__ = False

    def __init__(self, openai_api: OpenAIAPIService):
        self.openai_api = openai_api

    async def validate(
        self, request: ValidateTestCaseRequest
    ) -> ValidateTestCaseResponse:
        """
        Validate test cases against standards.

        Args:
            request: Validation request

        Returns:
            Validation report
        """
        results = []

        for idx, test_case in enumerate(request.test_cases):
            result = await self._validate_single_test_case(
                test_case, idx, request.strict_mode
            )
            results.append(result)

        # Calculate overall compliance
        valid_count = sum(1 for r in results if r.is_valid)
        total_count = len(results)
        overall_compliance = valid_count / total_count if total_count > 0 else 0.0

        # Generate summary
        summary = self._generate_summary(results, overall_compliance)

        return ValidateTestCaseResponse(
            total_tests=total_count,
            valid_tests=valid_count,
            invalid_tests=total_count - valid_count,
            results=results,
            overall_compliance=overall_compliance,
            summary=summary,
        )

    async def _validate_single_test_case(
        self, test_case: str, test_id: int, strict_mode: bool
    ) -> ValidationResult:
        """
        Validate a single test case.

        Args:
            test_case: Test case code string
            test_id: Test identifier
            strict_mode: Whether to use strict validation

        Returns:
            Validation result
        """
        issues = []

        # Check structure
        structure_valid = self._check_structure(test_case, issues)

        # Check AAA pattern
        aaa_compliance = self._check_aaa_pattern(test_case, issues)

        # Check Allure decorators
        allure_complete = self._check_allure_decorators(test_case, issues, strict_mode)

        # Use LLM for additional validation
        llm_issues = await self._llm_validation(test_case, strict_mode)
        issues.extend(llm_issues)

        is_valid = (
            structure_valid and aaa_compliance and allure_complete and len(issues) == 0
        )

        return ValidationResult(
            test_id=str(test_id),
            is_valid=is_valid,
            issues=issues,
            aaa_compliance=aaa_compliance,
            allure_decorators_complete=allure_complete,
            structure_valid=structure_valid,
        )

    def _check_structure(self, test_case: str, issues: List[ValidationIssue]) -> bool:
        """Check test case structure."""
        is_valid = True

        # Check for class definition
        if not re.search(r"class\s+\w+", test_case):
            issues.append(
                ValidationIssue(
                    severity=IssueSeverity.ERROR,
                    field="structure",
                    issue="Missing test class definition",
                    recommendation="Add a test class with @allure.manual decorator",
                )
            )
            is_valid = False

        # Check for test method
        if not re.search(r"def\s+test_\w+", test_case):
            issues.append(
                ValidationIssue(
                    severity=IssueSeverity.ERROR,
                    field="structure",
                    issue="Missing test method definition",
                    recommendation="Add a test method starting with 'test_'",
                )
            )
            is_valid = False

        # Check for description/steps
        if "allure.step" not in test_case:
            issues.append(
                ValidationIssue(
                    severity=IssueSeverity.WARNING,
                    field="structure",
                    issue="No test steps found",
                    recommendation="Add test steps using allure.step context manager",
                )
            )
            is_valid = False

        return is_valid

    def _check_aaa_pattern(self, test_case: str, issues: List[ValidationIssue]) -> bool:
        """Check AAA pattern compliance."""
        has_arrange = bool(
            re.search(r"(arrange|setup|prepare|initialize)", test_case, re.IGNORECASE)
        )
        has_act = bool(
            re.search(r"(act|execute|perform|action)", test_case, re.IGNORECASE)
        )
        has_assert = bool(
            re.search(r"(assert|verify|check|validate)", test_case, re.IGNORECASE)
        )

        if not has_arrange:
            issues.append(
                ValidationIssue(
                    severity=IssueSeverity.WARNING,
                    field="aaa_pattern",
                    issue="Arrange section not clearly identified",
                    recommendation="Add clear Arrange section with setup steps",
                )
            )

        if not has_act:
            issues.append(
                ValidationIssue(
                    severity=IssueSeverity.ERROR,
                    field="aaa_pattern",
                    issue="Act section not clearly identified",
                    recommendation="Add clear Act section with action steps",
                )
            )

        if not has_assert:
            issues.append(
                ValidationIssue(
                    severity=IssueSeverity.ERROR,
                    field="aaa_pattern",
                    issue="Assert section not clearly identified",
                    recommendation="Add clear Assert section with verification steps",
                )
            )

        return has_arrange and has_act and has_assert

    def _check_allure_decorators(
        self, test_case: str, issues: List[ValidationIssue], strict_mode: bool
    ) -> bool:
        """Check Allure decorators completeness."""
        required_decorators = {
            "@allure.manual": "Missing @allure.manual decorator",
            "@allure.label": "Missing @allure.label decorator for owner",
            "@allure.feature": "Missing @allure.feature decorator",
            "@allure.story": "Missing @allure.story decorator",
            "@allure.suite": "Missing @allure.suite decorator",
            "@pytest.mark.manual": "Missing @pytest.mark.manual decorator",
            "@allure.description": "Missing @allure.description decorator",
            "@allure.title": "Missing @allure.title decorator",
            "@allure.tag": "Missing @allure.tag decorator",
        }

        is_complete = True

        for decorator, message in required_decorators.items():
            if decorator not in test_case:
                severity = IssueSeverity.ERROR if strict_mode else IssueSeverity.WARNING
                issues.append(
                    ValidationIssue(
                        severity=severity,
                        field="allure_decorators",
                        issue=message,
                        recommendation=f"Add {decorator} decorator",
                    )
                )
                if strict_mode:
                    is_complete = False

        # Check for priority label
        if "@allure.label" in test_case and "priority" not in test_case.lower():
            issues.append(
                ValidationIssue(
                    severity=IssueSeverity.WARNING,
                    field="allure_decorators",
                    issue="Priority label not found",
                    recommendation="Add @allure.label('priority', 'CRITICAL'|'NORMAL'|'LOW')",
                )
            )
            is_complete = False

        return is_complete

    async def _llm_validation(
        self, test_case: str, strict_mode: bool
    ) -> List[ValidationIssue]:
        """Use LLM for additional validation."""
        try:
            prompt = f"""Validate the following test case against Allure TestOps as Code standards.

Test Case:
{test_case}

Strict Mode: {strict_mode}

Check for code quality and best practices
Return JSON with issues:
{{
    "issues": [
        {{
            "severity": "<ERROR|WARNING|INFO>",
            "field": "<field name>",
            "issue": "<description>",
            "recommendation": "<how to fix>"
        }}
    ]
}}"""
            system_prompt = """You are an expert QA engineer validating test cases against Allure TestOps standards."""
            response = await self.openai_api.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.2,
                max_tokens=1000,
            )

            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                issues = []
                for issue_data in data.get("issues", []):
                    issue_data["severity"] = IssueSeverity(issue_data["severity"])
                    issues.append(ValidationIssue(**issue_data))
                return issues

        except Exception as e:
            logger.warning(f"Error in LLM validation: {e}")

        return []

    def _generate_summary(
        self, results: List[ValidationResult], overall_compliance: float
    ) -> str:
        """Generate validation summary."""
        error_count = sum(
            len([i for i in r.issues if i.severity == IssueSeverity.ERROR])
            for r in results
        )
        warning_count = sum(
            len([i for i in r.issues if i.severity == IssueSeverity.WARNING])
            for r in results
        )

        summary = f"""Validation Summary:
- Total Tests: {len(results)}
- Valid Tests: {sum(1 for r in results if r.is_valid)}
- Invalid Tests: {sum(1 for r in results if not r.is_valid)}
- Overall Compliance: {overall_compliance:.1%}
- Errors Found: {error_count}
- Warnings Found: {warning_count}
"""

        if overall_compliance < 0.8:
            summary += "\n⚠️ Compliance is below 80%. Review and fix issues."
        elif overall_compliance == 1.0:
            summary += "\n✅ All tests are compliant!"
        else:
            summary += "\n✓ Most tests are compliant. Review warnings for improvements."

        return summary
