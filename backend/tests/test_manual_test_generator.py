import pytest
from pytest_httpx import HTTPXMock
from app.config import settings
from app.models import GenerateManualTestCaseRequest, Priority
from app.services import OpenAIAPIService, ManualTestCaseGeneratorService


@pytest.mark.asyncio
async def test_manual_test_generator_for_api(
    httpx_mock: HTTPXMock, mock_api_manual_test: str
):
    svc = ManualTestCaseGeneratorService(OpenAIAPIService())
    httpx_mock.add_response(
        url=f"{settings.openai_api_url}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": mock_api_manual_test}}]},
        status_code=200,
    )

    req = GenerateManualTestCaseRequest(
        feature="API-тестирование Evolution Compute",
        jira_link="https://emmanuelonyekaba.atlassian.net/browse/KENZYQA-2",
        jira_name="KENZYQA-2",
        owner="Эммануэль Оньекаба",
        priority=Priority.NORMAL,
        story="Evolution Compute (VMs, Disks, Flavors)",
        test_type="API",
        requirements="""
API-спецификация: https://cloud.ru/docs/virtual-machines/ug/topics/api-ref-v3
Базовый endpoint: https://compute.api.cloud.ru

Блок 1. Раздел VMs (Виртуальные машины)
• Получение списка виртуальных машин.
• Изменение статуса виртуальной машины.
• Создание виртуальной машины.
• Получение информации о виртуальной машине.
• Обновление виртуальной машины.
• Удаление виртуальной машины.

Блок 2. Раздел Disks
• Получение списка дисков.
• Создание диска.
• Получение информации о диске.
• Обновление диска.
• Удаление диска.
• Подключение диска к ВМ.
• Отключение диска от ВМ.
""",
    )
    res = await svc.generate(req)
    assert res.test_case.feature == req.feature
    assert res.test_case.priority == req.priority
    assert len(res.test_case.steps) == 24


@pytest.mark.asyncio
async def test_manual_test_generator_for_ui(
    httpx_mock: HTTPXMock, mock_ui_manual_test: str
):
    svc = ManualTestCaseGeneratorService(OpenAIAPIService())
    httpx_mock.add_response(
        url=f"{settings.openai_api_url}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": mock_ui_manual_test}}]},
        status_code=200,
    )

    req = GenerateManualTestCaseRequest(
        feature="UI-тестирование калькулятора цен",
        jira_link="https://emmanuelonyekaba.atlassian.net/browse/KENZYQA-3",
        jira_name="KENZYQA-3",
        owner="Эммануэль Оньекаба",
        priority=Priority.NORMAL,
        story="Начальная страница",
        test_type="UI",
        requirements="""
Блок 1. Начальная страница
• Отображение главной страницы с пояснительным текстом.
• Кнопка "Добавить сервис" доступна и кликабельна.
• Отображение шагов процесса (добавление → конфигурация → подключение).
• Отображение текущей общей стоимости (с указанием «в месяц с НДС»).
• Отображение дисклеймера об отсутствии офертности.
""",
    )
    res = await svc.generate(req)
    assert res.test_case.feature == req.feature
    assert res.test_case.priority == req.priority
    assert len(res.test_case.steps) == 7
