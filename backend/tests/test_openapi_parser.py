import pytest
from app.services import OpenAPIParserService


@pytest.mark.asyncio
async def test_openapi_parser_extracts_endpoints_from_json(mock_api_spec_json: str):
    svc = OpenAPIParserService()
    spec = svc.parse(mock_api_spec_json, format="json")
    eps = svc.get_endpoints(spec)
    assert len(eps) == 9
    assert eps[0]["path"] == "/"


@pytest.mark.asyncio
async def test_openapi_parser_extracts_endpoints_from_yaml(mock_api_spec_yaml: str):
    svc = OpenAPIParserService()
    spec = svc.parse(mock_api_spec_yaml, format="yaml")
    eps = svc.get_endpoints(spec)
    assert len(eps) == 9
    assert eps[0]["path"] == "/"


@pytest.mark.asyncio
async def test_openapi_parser_filters_endpoints_from_json(mock_api_spec_json: str):
    svc = OpenAPIParserService()
    spec = svc.parse(mock_api_spec_json, format="json")
    eps = svc.get_endpoints(spec, ["/", "/api/v1/health"])
    assert len(eps) == 2


@pytest.mark.asyncio
async def test_openapi_parser_filters_endpoints(mock_api_spec_yaml: str):
    svc = OpenAPIParserService()
    spec = svc.parse(mock_api_spec_yaml, format="yaml")
    eps = svc.get_endpoints(spec, ["/", "/api/not-found"])
    assert len(eps) == 1
