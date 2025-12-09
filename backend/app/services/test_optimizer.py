"""Test case optimization service."""

import logging
import re
from typing import List, Dict, Set
from app.services.openai_api import OpenAIAPIService
from app.models.test_optimization import (
    CoverageAnalysis,
    DuplicateTest,
    CoverageGap,
    OptimizationSuggestion,
    OptimizationReport,
    GapSeverity,
)

logger = logging.getLogger(__name__)


class TestOptimizerService:
    """Service for optimizing test cases (coverage analysis, duplicates, gaps)."""

    __test__ = False

    def __init__(self, openai_api: OpenAIAPIService):
        self.openai_api = openai_api

    async def analyze_coverage(
        self, test_cases: List[str], requirements: str
    ) -> CoverageAnalysis:
        """
        Analyze test coverage.

        Args:
            test_cases: List of test case code strings
            requirements: Requirements description

        Returns:
            Coverage analysis result
        """
        try:
            # Extract functionality from requirements
            functionality_items = self._extract_functionality_items(requirements)

            # Extract covered areas from test cases
            covered_areas = self._extract_covered_areas(test_cases)

            # Use LLM to analyze coverage
            prompt = f"""Analyze test coverage based on the following requirements and test cases.

Requirements:
{requirements}

Test Cases:
{len(test_cases)} test cases provided

Functionality Items:
{chr(10).join(f'- {item}' for item in functionality_items)}

Covered Areas in Tests:
{chr(10).join(f'- {area}' for area in covered_areas)}

Provide a JSON response with:
{{
    "total_functionality": <number>,
    "covered_functionality": <number>,
    "coverage_percentage": <float 0-100>,
    "covered_areas": [<list of covered functionality>],
    "uncovered_areas": [<list of uncovered functionality>]
}}"""

            system_prompt = """You are an expert QA analyst. Analyze test coverage comprehensively and identify gaps."""

            response = await self.openai_api.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=1500,
            )

            # Parse JSON response
            import json

            try:
                # Extract JSON from response
                json_match = re.search(r"\{.*\}", response, re.DOTALL)
                if json_match:
                    coverage_data = json.loads(json_match.group(0))
                else:
                    # Fallback to basic analysis
                    coverage_data = self._basic_coverage_analysis(
                        functionality_items, covered_areas
                    )
            except json.JSONDecodeError:
                coverage_data = self._basic_coverage_analysis(
                    functionality_items, covered_areas
                )

            return CoverageAnalysis(
                total_functionality=coverage_data.get(
                    "total_functionality", len(functionality_items)
                ),
                covered_functionality=coverage_data.get(
                    "covered_functionality", len(covered_areas)
                ),
                coverage_percentage=coverage_data.get("coverage_percentage", 0.0),
                covered_areas=coverage_data.get("covered_areas", covered_areas),
                uncovered_areas=coverage_data.get("uncovered_areas", []),
            )

        except Exception as e:
            logger.error(f"Error analyzing coverage: {e}")
            # Return basic analysis on error
            return self._basic_coverage_analysis(
                self._extract_functionality_items(requirements),
                self._extract_covered_areas(test_cases),
            )

    async def find_duplicates(self, test_cases: List[str]) -> List[DuplicateTest]:
        """
        Find duplicate test cases.

        Args:
            test_cases: List of test case code strings

        Returns:
            List of duplicate test identifications
        """
        duplicates = []

        try:
            # Use LLM to identify duplicates
            prompt = f"""Analyze the following test cases and identify duplicates.

Test Cases ({len(test_cases)} total):
{chr(10).join(f'--- Test Case {i+1} ---{chr(10)}{tc[:500]}...' for i, tc in enumerate(test_cases))}

Provide a JSON response with duplicate pairs:
{{
    "duplicates": [
        {{
            "test_id_1": "<index or identifier>",
            "test_id_2": "<index or identifier>",
            "similarity_score": <float 0-1>,
            "reason": "<why they are duplicates>",
            "recommendation": "<how to resolve>"
        }}
    ]
}}"""

            system_prompt = """You are an expert QA analyst. Identify duplicate test cases accurately."""

            response = await self.openai_api.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=2000,
            )

            # Parse JSON response
            import json

            try:
                json_match = re.search(r"\{.*\}", response, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(0))
                    for dup in data.get("duplicates", []):
                        duplicates.append(DuplicateTest(**dup))
            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Error parsing duplicates: {e}")
                # Fallback to basic duplicate detection
                duplicates = self._basic_duplicate_detection(test_cases)

        except Exception as e:
            logger.error(f"Error finding duplicates: {e}")
            duplicates = self._basic_duplicate_detection(test_cases)

        return duplicates

    async def identify_gaps(
        self,
        test_cases: List[str],
        requirements: str,
        coverage_analysis: CoverageAnalysis,
    ) -> List[CoverageGap]:
        """
        Identify coverage gaps.

        Args:
            test_cases: List of test case code strings
            requirements: Requirements description
            coverage_analysis: Coverage analysis result

        Returns:
            List of coverage gaps
        """
        gaps = []

        try:
            prompt = f"""Identify test coverage gaps based on requirements and current test coverage.

Requirements:
{requirements}

Uncovered Areas:
{chr(10).join(f'- {area}' for area in coverage_analysis.uncovered_areas)}

Provide a JSON response with coverage gaps:
{{
    "gaps": [
        {{
            "functionality": "<uncovered functionality>",
            "severity": "<CRITICAL|HIGH|MEDIUM|LOW>",
            "description": "<description of gap>",
            "suggested_tests": ["<suggested test 1>", "<suggested test 2>"]
        }}
    ]
}}"""

            system_prompt = """You are an expert QA analyst. Identify critical coverage gaps and suggest improvements."""

            response = await self.openai_api.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=2000,
            )

            # Parse JSON response
            import json

            try:
                json_match = re.search(r"\{.*\}", response, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(0))
                    for gap_data in data.get("gaps", []):
                        gap_data["severity"] = GapSeverity(gap_data["severity"])
                        gaps.append(CoverageGap(**gap_data))
            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Error parsing gaps: {e}")
                # Fallback to basic gap identification
                gaps = self._basic_gap_identification(coverage_analysis.uncovered_areas)

        except Exception as e:
            logger.error(f"Error identifying gaps: {e}")
            gaps = self._basic_gap_identification(coverage_analysis.uncovered_areas)

        return gaps

    async def generate_optimization_report(
        self, test_cases: List[str], requirements: str
    ) -> OptimizationReport:
        """
        Generate complete optimization report.

        Args:
            test_cases: List of test case code strings
            requirements: Requirements description

        Returns:
            Complete optimization report
        """
        # Analyze coverage
        coverage_analysis = await self.analyze_coverage(test_cases, requirements)

        # Find duplicates
        duplicates = await self.find_duplicates(test_cases)

        # Identify gaps
        gaps = await self.identify_gaps(test_cases, requirements, coverage_analysis)

        # Generate suggestions
        suggestions = await self._generate_suggestions(
            test_cases, coverage_analysis, duplicates, gaps
        )

        # Identify outdated and conflicting tests
        outdated_tests = await self._identify_outdated_tests(test_cases, requirements)
        conflicting_tests = await self._identify_conflicting_tests(test_cases)

        return OptimizationReport(
            coverage_analysis=coverage_analysis,
            duplicates=duplicates,
            coverage_gaps=gaps,
            suggestions=suggestions,
            outdated_tests=outdated_tests,
            conflicting_tests=conflicting_tests,
        )

    def _extract_functionality_items(self, requirements: str) -> List[str]:
        """Extract functionality items from requirements."""
        # Simple extraction - can be enhanced
        items = []
        lines = requirements.split("\n")
        for line in lines:
            if line.strip().startswith("-") or line.strip().startswith("*"):
                items.append(line.strip().lstrip("-* "))
        return items if items else ["Main functionality"]

    def _extract_covered_areas(self, test_cases: List[str]) -> List[str]:
        """Extract covered areas from test cases."""
        areas = set()
        for tc in test_cases:
            # Extract feature and story from Allure decorators
            feature_match = re.search(r'@allure\.feature\(["\'](.+?)["\']\)', tc)
            if feature_match:
                areas.add(feature_match.group(1))

            story_match = re.search(r'@allure\.story\(["\'](.+?)["\']\)', tc)
            if story_match:
                areas.add(story_match.group(1))

        return list(areas)

    def _basic_coverage_analysis(
        self, functionality_items: List[str], covered_areas: List[str]
    ) -> CoverageAnalysis:
        """Basic coverage analysis fallback."""
        total = len(functionality_items) if functionality_items else 1
        covered = len(covered_areas)
        percentage = (covered / total * 100) if total > 0 else 0.0

        return CoverageAnalysis(
            total_functionality=total,
            covered_functionality=covered,
            coverage_percentage=percentage,
            covered_areas=covered_areas,
            uncovered_areas=[
                item for item in functionality_items if item not in covered_areas
            ],
        )

    def _basic_duplicate_detection(self, test_cases: List[str]) -> List[DuplicateTest]:
        """Basic duplicate detection fallback."""
        duplicates = []
        # Simple similarity check based on test titles
        for i, tc1 in enumerate(test_cases):
            title1 = re.search(r'@allure\.title\(["\'](.+?)["\']\)', tc1)
            if not title1:
                continue

            for j, tc2 in enumerate(test_cases[i + 1 :], start=i + 1):
                title2 = re.search(r'@allure\.title\(["\'](.+?)["\']\)', tc2)
                if not title2:
                    continue

                if title1.group(1).lower() == title2.group(1).lower():
                    duplicates.append(
                        DuplicateTest(
                            test_id_1=str(i),
                            test_id_2=str(j),
                            similarity_score=1.0,
                            reason="Identical test titles",
                            recommendation="Merge or differentiate the tests",
                        )
                    )

        return duplicates

    def _basic_gap_identification(
        self, uncovered_areas: List[str]
    ) -> List[CoverageGap]:
        """Basic gap identification fallback."""
        return [
            CoverageGap(
                functionality=area,
                severity=GapSeverity.MEDIUM,
                description=f"Missing test coverage for: {area}",
                suggested_tests=[f"Test for {area}"],
            )
            for area in uncovered_areas
        ]

    async def _generate_suggestions(
        self,
        test_cases: List[str],
        coverage_analysis: CoverageAnalysis,
        duplicates: List[DuplicateTest],
        gaps: List[CoverageGap],
    ) -> List[OptimizationSuggestion]:
        """Generate optimization suggestions."""
        suggestions = []

        # Suggestions based on duplicates
        for dup in duplicates:
            suggestions.append(
                OptimizationSuggestion(
                    test_id=dup.test_id_1,
                    suggestion_type="duplicate",
                    description=f"Merge with test {dup.test_id_2}: {dup.reason}",
                    impact="Reduces maintenance overhead",
                    effort="Low",
                )
            )

        # Suggestions based on gaps
        for gap in gaps:
            if gap.severity in [GapSeverity.CRITICAL, GapSeverity.HIGH]:
                suggestions.append(
                    OptimizationSuggestion(
                        suggestion_type="coverage_gap",
                        description=f"Add tests for: {gap.functionality}",
                        impact="Improves test coverage",
                        effort="Medium",
                    )
                )

        # Suggestions based on coverage percentage
        if coverage_analysis.coverage_percentage < 80:
            suggestions.append(
                OptimizationSuggestion(
                    suggestion_type="coverage",
                    description=f"Coverage is {coverage_analysis.coverage_percentage:.1f}%, aim for 80%+",
                    impact="Improves quality assurance",
                    effort="High",
                )
            )

        return suggestions

    async def _identify_outdated_tests(
        self, test_cases: List[str], requirements: str
    ) -> List[str]:
        """Identify outdated tests."""
        # Use LLM to identify outdated tests
        try:
            prompt = f"""Identify outdated test cases based on current requirements.

Requirements:
{requirements}

Test Cases:
{len(test_cases)} test cases provided

Return JSON with outdated test IDs:
{{
    "outdated": ["<test_id_1>", "<test_id_2>"]
}}"""

            response = await self.openai_api.generate(
                prompt=prompt, temperature=0.3, max_tokens=500
            )

            import json

            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                return data.get("outdated", [])
        except Exception as e:
            logger.warning(f"Error identifying outdated tests: {e}")

        return []

    async def _identify_conflicting_tests(self, test_cases: List[str]) -> List[str]:
        """Identify conflicting tests."""
        # Use LLM to identify conflicting tests
        try:
            prompt = f"""Identify conflicting test cases (tests that contradict each other).

Test Cases:
{len(test_cases)} test cases provided

Return JSON with conflicting test IDs:
{{
    "conflicting": ["<test_id_1>", "<test_id_2>"]
}}"""

            response = await self.openai_api.generate(
                prompt=prompt, temperature=0.3, max_tokens=500
            )

            import json

            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                return data.get("conflicting", [])
        except Exception as e:
            logger.warning(f"Error identifying conflicting tests: {e}")

        return []
