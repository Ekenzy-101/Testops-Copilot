/** API client service */
import type {
  GenerateManualTestCaseRequest,
  GenerateManualTestCaseResponse,
  GenerateBatchTestCaseRequest,
  GenerateAutoTestCaseRequest,
  GenerateAutoTestCaseResponse,
  OptimizeTestCaseRequest,
  OptimizeTestCaseResponse,
  ValidateTestCaseRequest,
  ValidateTestCaseResponse,
  HealthCheck,
  CommitTestCaseRequest,
  CommitTestCaseResponse,
  GenerateTestPlanRequest,
  GenerateTestPlanResponse,
  AnalyzeDefectRequest,
  AnalyzeDefectResponse,
} from "../types";

const API_BASE_URL =
  process.env.PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: response.statusText }));
        throw new Error(
          error.detail || `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  async analyzeDefects(
    request: AnalyzeDefectRequest,
  ): Promise<AnalyzeDefectResponse> {
    return this.request<AnalyzeDefectResponse>("/api/v1/defects/analyze", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async commitTestCases(
    request: CommitTestCaseRequest,
  ): Promise<CommitTestCaseResponse> {
    return this.request<CommitTestCaseResponse>("/api/v1/test-cases/commit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generateAutoTestCase(
    request: GenerateAutoTestCaseRequest,
  ): Promise<GenerateAutoTestCaseResponse> {
    return this.request<GenerateAutoTestCaseResponse>(
      "/api/v1/test-cases/generate-auto",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async generateManualTestCase(
    request: GenerateManualTestCaseRequest,
  ): Promise<GenerateManualTestCaseResponse> {
    return this.request<GenerateManualTestCaseResponse>(
      "/api/v1/test-cases/generate-manual",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async generateManualTestCases(
    request: GenerateBatchTestCaseRequest,
  ): Promise<GenerateManualTestCaseResponse[]> {
    return this.request<GenerateManualTestCaseResponse[]>(
      "/api/v1/test-cases/generate-batch",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async generateTestPlan(
    request: GenerateTestPlanRequest,
  ): Promise<GenerateTestPlanResponse> {
    return this.request<GenerateTestPlanResponse>(
      "/api/v1/test-plan/generate",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async optimizeTestCases(
    request: OptimizeTestCaseRequest,
  ): Promise<OptimizeTestCaseResponse> {
    return this.request<OptimizeTestCaseResponse>(
      "/api/v1/test-cases/optimize",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async validateTestCases(
    request: ValidateTestCaseRequest,
  ): Promise<ValidateTestCaseResponse> {
    return this.request<ValidateTestCaseResponse>(
      "/api/v1/test-cases/validate",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async healthCheck(): Promise<HealthCheck> {
    return this.request<HealthCheck>("/api/v1/health", {
      method: "GET",
    });
  }
}

export const apiClient = new ApiClient();
