"""OpenAPI 3.0 specification parser."""

import yaml
import json
import logging
from typing import Dict, List, Any, Optional
from openapi_spec_validator import validate

logger = logging.getLogger(__name__)


class OpenAPIParserService:
    """Service for parsing OpenAPI 3.0 specifications."""

    def parse(self, spec_content: str, format: str = "yaml") -> Dict[str, Any]:
        """
        Parse OpenAPI specification.

        Args:
            spec_content: OpenAPI spec content (YAML or JSON)
            format: Format of the spec ("yaml" or "json")

        Returns:
            Parsed OpenAPI specification as dictionary

        Raises:
            ValueError: If spec is invalid
        """
        try:
            if format.lower() == "yaml":
                spec = yaml.safe_load(spec_content)
            elif format.lower() == "json":
                spec = json.loads(spec_content)
            else:
                raise ValueError(f"Unsupported format: {format}")

            try:
                validate(spec)
            except Exception as e:
                logger.warning(f"OpenAPI spec validation warning: {e}")
            return spec
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML: {e}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")

    def get_endpoints(self, spec: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract all endpoints from OpenAPI spec.

        Args:
            spec: Parsed OpenAPI specification

        Returns:
            List of endpoint definitions
        """
        endpoints = []
        paths = spec.get("paths", {})
        for path, path_item in paths.items():
            for method, operation in path_item.items():
                if method in [
                    "get",
                    "post",
                    "put",
                    "patch",
                    "delete",
                    "head",
                    "options",
                ]:
                    endpoints.append(
                        {
                            "path": path,
                            "method": method.upper(),
                            "operation_id": operation.get(
                                "operationId", f"{method}_{path}"
                            ),
                            "summary": operation.get("summary", ""),
                            "description": operation.get("description", ""),
                            "parameters": operation.get("parameters", []),
                            "request_body": operation.get("requestBody"),
                            "responses": operation.get("responses", {}),
                            "tags": operation.get("tags", []),
                        }
                    )
        return endpoints

    def get_schemas(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract all schemas from OpenAPI spec.

        Args:
            spec: Parsed OpenAPI specification

        Returns:
            Dictionary of schema definitions
        """
        components = spec.get("components", {})
        return components.get("schemas", {})

    def filter_endpoints(
        self,
        endpoints: List[Dict[str, Any]],
        tags: Optional[List[str]] = None,
        methods: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Filter endpoints by tags and/or methods.

        Args:
            endpoints: List of endpoints
            tags: Optional list of tags to filter by
            methods: Optional list of HTTP methods to filter by

        Returns:
            Filtered list of endpoints
        """
        result = endpoints
        if tags:
            result = [
                ep for ep in result if any(tag in ep.get("tags", []) for tag in tags)
            ]
        if methods:
            result = [ep for ep in result if ep.get("method") in methods]
        return result

    def get_security_schemes(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract security schemes from OpenAPI spec.

        Args:
            spec: Parsed OpenAPI specification

        Returns:
            Dictionary of security schemes
        """
        components = spec.get("components", {})
        return components.get("securitySchemes", {})
