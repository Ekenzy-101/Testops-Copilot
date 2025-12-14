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

    def get_endpoints(
        self, spec: Dict[str, Any], paths: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Extract and filter endpoints from OpenAPI spec by paths.

        Args:
            spec: Parsed OpenAPI specification
            paths: Optional list of paths to filter by

        Returns:
            List of endpoint definitions
        """
        endpoints = []
        for path, path_item in spec.get("paths", {}).items():
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

        if paths:
            endpoints = [ep for ep in endpoints if ep["path"] in paths]

        return endpoints
