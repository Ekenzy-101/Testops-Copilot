import pytest
from pathlib import Path

@pytest.fixture
def mock_dir():
    return Path(__file__).parent / "mocks"

@pytest.fixture
def mock_api_spec_json(mock_dir: Path):
    return (mock_dir / "api_spec.json").read_text()

@pytest.fixture
def mock_api_spec_yaml(mock_dir: Path):
    return (mock_dir / "api_spec.yml").read_text()

@pytest.fixture
def mock_api_manual_test(mock_dir: Path):
    return (mock_dir / "api_manual_test.py").read_text()

@pytest.fixture
def mock_ui_manual_test(mock_dir: Path):
    return (mock_dir / "ui_manual_test.py").read_text()